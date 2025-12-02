import express from "express";
import db from "../database.js";
import { authenticateToken } from "./auth.js";
import { sendOtpEmail } from "../services/emailService.js";
import bodyParser from "body-parser";

const router = express.Router();

// allow form POST from demo HTML
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Provider-agnostic: create a payment link for an order
router.post("/create-link", authenticateToken, async (req, res) => {
  try {
    const { items, return_url, cancel_url, method_hint, require_otp } =
      req.body;
    // Use authenticated user as canonical source of truth
    const user_id = req.user && req.user.id ? req.user.id : null;
    let customer_name =
      req.user && req.user.username ? req.user.username : null;
    let customer_email = req.user && req.user.email ? req.user.email : null;

    // If we have a user_id but no explicit customer name/email, resolve from users table
    if (user_id && (!customer_name || !customer_email)) {
      try {
        const u = await db.getAsync(
          "SELECT user_username, user_email FROM users WHERE user_id = ?",
          [user_id]
        );
        if (u) {
          if (!customer_name && u.user_username)
            customer_name = u.user_username;
          if (!customer_email && u.user_email) customer_email = u.user_email;
        }
      } catch (e) {
        // ignore lookup errors — insertion will still proceed with whatever data available
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items are required" });
    }

    // Calculate total
    let total = 0;
    for (const it of items) {
      const p = await db.getAsync(
        "SELECT * FROM products WHERE product_id = ?",
        [it.product_id]
      );
      if (!p)
        return res
          .status(404)
          .json({ error: `Product ${it.product_id} not found` });
      total += p.product_price * it.quantity;
    }

    // Create order as pending (we'll attach items on payment webhook or after redirect depending on flow)
    // Be defensive: some DBs may not have the newer columns (migrations not run). Check available columns
    const info = await db.allAsync("PRAGMA table_info(orders)");
    const cols = info.map((c) => c.name);
    const insertCols = [];
    const params = [];

    if (cols.includes("order_user_id")) {
      insertCols.push("order_user_id");
      params.push(user_id || null);
    }
    if (cols.includes("order_customer_name")) {
      insertCols.push("order_customer_name");
      params.push(customer_name || null);
    }
    if (cols.includes("order_customer_email")) {
      insertCols.push("order_customer_email");
      params.push(customer_email || null);
    }
    if (cols.includes("order_total")) {
      insertCols.push("order_total");
      params.push(total.toFixed(2));
    }
    if (cols.includes("order_status")) {
      insertCols.push("order_status");
      params.push("pending");
    }

    if (insertCols.length === 0) {
      throw new Error("Orders table has no writable columns for insert");
    }

    const placeholders = insertCols.map(() => "?").join(",");
    const sql = `INSERT INTO orders (${insertCols.join(
      ","
    )}) VALUES (${placeholders})`;
    const orderRes = await db.runAsync(sql, params);
    const orderId = orderRes.lastID;

    // Create order_items immediately to keep consistency
    for (const it of items) {
      const p = await db.getAsync(
        "SELECT * FROM products WHERE product_id = ?",
        [it.product_id]
      );
      await db.runAsync(
        `INSERT INTO order_items (order_item_order_id, order_item_product_id, order_item_product_name, order_item_quantity, order_item_price) VALUES (?, ?, ?, ?, ?)`,
        [orderId, p.product_id, p.product_name, it.quantity, p.product_price]
      );
    }

    // Create payments record with status pending
    // Defensive: only insert columns that exist in the payments table (older DBs may lack 'metadata')
    const payInfo = await db.allAsync("PRAGMA table_info(payments)");
    const payCols = payInfo.map((c) => c.name);
    const payInsertCols = [];
    const payParams = [];

    if (payCols.includes("payment_order_id")) {
      payInsertCols.push("payment_order_id");
      payParams.push(orderId);
    }
    if (payCols.includes("payment_amount")) {
      payInsertCols.push("payment_amount");
      payParams.push(total.toFixed(2));
    }
    if (payCols.includes("payment_method")) {
      payInsertCols.push("payment_method");
      payParams.push(method_hint || null);
    }
    if (payCols.includes("payment_status")) {
      payInsertCols.push("payment_status");
      payParams.push("pending");
    }
    if (payCols.includes("payment_metadata")) {
      payInsertCols.push("payment_metadata");
      payParams.push(null);
    }

    if (payInsertCols.length === 0) {
      throw new Error("Payments table has no writable columns for insert");
    }

    const payPlaceholders = payInsertCols.map(() => "?").join(",");
    const paySql = `INSERT INTO payments (${payInsertCols.join(
      ","
    )}) VALUES (${payPlaceholders})`;
    const paymentRes = await db.runAsync(paySql, payParams);
    const paymentId = paymentRes.lastID;

    // Attach payment_id to order if column present
    try {
      await db.runAsync("UPDATE orders SET payment_id = ? WHERE order_id = ?", [
        paymentId,
        orderId,
      ]);
    } catch (e) {
      // ignore if column not present
    }

    // Build a fake provider link for sandbox/dev: in production this will call the provider API
    // If client requested OTP flow, return a link that starts the OTP flow.
    // Note: for OTP-backed flow we may prefer to initiate OTP before persisting; see /initiate-otp
    const otpParam = require_otp ? "&otp=1" : "";
    const fakeLink = `${req.protocol}://${req.get(
      "host"
    )}/api/payments/redirect-simulate?payment_id=${paymentId}&order_id=${orderId}&return_url=${encodeURIComponent(
      return_url || ""
    )}${otpParam}`;

    res.json({ payment_link: fakeLink, orderId, paymentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Simulate redirect (for sandbox/dev) - this simulates the provider redirecting back after payment
router.get("/redirect-simulate", async (req, res) => {
  try {
    const { payment_id, order_id, return_url } = req.query;

    // If otp query flag is present, generate and show OTP verification form
    const useOtp = req.query.otp === "1" || req.query.otp === "true";

    if (useOtp) {
      // generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const metadata = JSON.stringify({
        otp,
        sent_at: new Date().toISOString(),
      });
      try {
        await db.runAsync(
          "UPDATE payments SET payment_metadata = ? WHERE payment_id = ?",
          [metadata, payment_id]
        );
      } catch (e) {
        // ignore if metadata column missing
      }

      // Try to resolve a recipient email: prefer order.order_customer_email, else lookup user email
      let recipient = null;
      try {
        const orderRow = await db.getAsync(
          "SELECT order_customer_email, order_user_id FROM orders WHERE order_id = ?",
          [order_id]
        );
        if (orderRow && orderRow.order_customer_email)
          recipient = orderRow.order_customer_email;
        else if (orderRow && orderRow.order_user_id) {
          const user = await db.getAsync(
            "SELECT user_email FROM users WHERE user_id = ?",
            [orderRow.order_user_id]
          );
          if (user && user.user_email) recipient = user.user_email;
        }
      } catch (e) {
        // ignore lookup errors
      }

      // Send email if we have a recipient; keep rendering demo page regardless
      if (recipient) {
        try {
          await sendOtpEmail(recipient, otp, order_id);
        } catch (e) {
          console.warn(
            "Failed to send OTP email (will still render demo page):",
            e.message || e
          );
        }
      }

      // Render a minimal HTML form for demo verification (no frontend changes required)
      const html = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>OTP Verification (Demo)</title></head>
  <body>
    <h2>Demo OTP Sent</h2>
    <p>For this demo the OTP is shown here: <strong>${otp}</strong></p>
    <form method="POST" action="/api/payments/verify-otp">
      <input type="hidden" name="payment_id" value="${payment_id}" />
      <input type="hidden" name="order_id" value="${order_id}" />
      <input type="hidden" name="return_url" value="${return_url || ""}" />
      <label>Enter OTP: <input name="otp" /></label>
      <button type="submit">Verify OTP</button>
    </form>
  </body>
</html>`;

      res.setHeader("Content-Type", "text/html");
      return res.send(html);
    }

    // Default behavior: immediately complete payment (no OTP)
    // Mark payment completed
    await db.runAsync(
      "UPDATE payments SET payment_status = ?, payment_provider_txn_id = ? WHERE payment_id = ?",
      ["completed", `SIM-${Date.now()}`, payment_id]
    );

    // Update order status
    await db.runAsync("UPDATE orders SET order_status = ? WHERE order_id = ?", [
      "processing",
      order_id,
    ]);

    if (return_url) {
      // Redirect back to app (client handles confirmation)
      return res.redirect(
        return_url + `?orderId=${order_id}&paymentId=${payment_id}`
      );
    }

    res.json({ message: "Simulated payment complete", order_id, payment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP (demo). Expects form-encoded or JSON body with { payment_id, order_id, otp, return_url }
router.post("/verify-otp", async (req, res) => {
  try {
    const { payment_id, order_id, otp, return_url } = req.body || {};
    if (!payment_id || !order_id || !otp)
      return res
        .status(400)
        .json({ error: "payment_id, order_id and otp are required" });

    // Read payment metadata
    const payment = await db.getAsync(
      "SELECT * FROM payments WHERE payment_id = ?",
      [payment_id]
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    let metadata = null;
    try {
      metadata = payment.payment_metadata
        ? JSON.parse(payment.payment_metadata)
        : null;
    } catch (e) {
      metadata = null;
    }

    if (!metadata || metadata.otp !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // OTP valid -> mark payment and order completed
    await db.runAsync(
      "UPDATE payments SET payment_status = ?, payment_provider_txn_id = ? WHERE payment_id = ?",
      ["completed", `SIM-${Date.now()}`, payment_id]
    );
    await db.runAsync("UPDATE orders SET order_status = ? WHERE order_id = ?", [
      "processing",
      order_id,
    ]);

    if (return_url) {
      return res.redirect(
        return_url + `?orderId=${order_id}&paymentId=${payment_id}`
      );
    }

    res.json({
      message: "OTP verified, payment completed",
      order_id,
      payment_id,
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    res.status(500).json({ error: err.message });
  }
});

// New: initiate OTP-backed payment WITHOUT creating order/payment records yet.
// Expects: { items, return_url, method_hint }
// Returns: { requestId }
router.post("/initiate-otp", authenticateToken, async (req, res) => {
  try {
    const { items, return_url, method_hint } = req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items required" });

    // Build payload to persist (stringified) - includes items, return_url, method, and user_id
    const payload = JSON.stringify({
      items,
      return_url: return_url || null,
      method_hint: method_hint || null,
      user_id,
    });

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Get user email for OTP
    let recipient = req.user && req.user.email ? req.user.email : null;
    if (!recipient && user_id) {
      try {
        const u = await db.getAsync(
          "SELECT user_email FROM users WHERE user_id = ?",
          [user_id]
        );
        if (u && u.user_email) recipient = u.user_email;
      } catch (e) {}
    }

    // insert into otp_requests with prefixed columns - now includes otp_payload
    const insertSql = `INSERT INTO otp_requests (otp_email, otp_code, otp_payload, otp_attempts, otp_expires_at) VALUES (?, ?, ?, ?, ?)`;
    const insertRes = await db.runAsync(insertSql, [
      recipient || null,
      otp,
      payload,
      0,
      expiresAt.toISOString(),
    ]);
    const requestId = insertRes.lastID;

    if (recipient) {
      try {
        await sendOtpEmail(recipient, otp, requestId);
      } catch (e) {
        console.warn("OTP email send failed:", e.message || e);
      }
    } else {
      console.log("No recipient for OTP request", requestId);
    }

    res.json({ requestId, otp_demo: otp }); // otp_demo for testing only - remove in production
  } catch (err) {
    console.error("initiate-otp error:", err);
    res.status(500).json({ error: err.message });
  }
});

// New: confirm OTP-backed payment. Expects { requestId, otp }
// On success: creates order, order_items, payments and returns { orderId, paymentId, payment_link }
router.post("/confirm-otp", authenticateToken, async (req, res) => {
  try {
    const { requestId, otp } = req.body || {};
    if (!requestId || !otp)
      return res.status(400).json({ error: "requestId and otp required" });

    const reqRow = await db.getAsync(
      "SELECT * FROM otp_requests WHERE otp_id = ?",
      [requestId]
    );
    if (!reqRow)
      return res.status(404).json({ error: "OTP request not found" });

    // Check if OTP has expired
    if (new Date(reqRow.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Check attempt limit (max 5 attempts) - check before OTP validation
    if (reqRow.otp_attempts >= 5) {
      return res
        .status(400)
        .json({ error: "Too many OTP attempts. Request new OTP" });
    }

    // Check if OTP matches
    if (String(reqRow.otp_code) !== String(otp)) {
      await db.runAsync(
        "UPDATE otp_requests SET otp_attempts = otp_attempts + 1 WHERE otp_id = ?",
        [requestId]
      );
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Parse payload from otp_payload column
    let payload = null;
    try {
      payload = reqRow.otp_payload ? JSON.parse(reqRow.otp_payload) : null;
    } catch (e) {
      console.error("Failed to parse OTP payload:", e);
      return res.status(400).json({ error: "Invalid OTP request data" });
    }

    if (
      !payload ||
      !Array.isArray(payload.items) ||
      payload.items.length === 0
    ) {
      return res.status(400).json({ error: "No items found in OTP request" });
    }

    const { items, return_url, method_hint } = payload;
    const user_id = req.user && req.user.id ? req.user.id : null;

    // Calculate total and gather product details
    let total = 0;
    const productDetails = [];
    for (const it of items) {
      const p = await db.getAsync(
        "SELECT * FROM products WHERE product_id = ?",
        [it.product_id]
      );
      if (!p)
        return res
          .status(404)
          .json({ error: `Product ${it.product_id} not found` });

      // Check if sufficient stock is available
      if (p.product_stock < it.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for ${p.product_name}. Available: ${p.product_stock}, Requested: ${it.quantity}`,
        });
      }

      total += p.product_price * it.quantity;
      productDetails.push({ ...p, quantity: it.quantity });
    }

    // Get customer info from users table
    let customer_name = null,
      customer_email = null;
    if (user_id) {
      const u = await db.getAsync(
        "SELECT user_username, user_email FROM users WHERE user_id = ?",
        [user_id]
      );
      if (u) {
        customer_name = u.user_username;
        customer_email = u.user_email;
      }
    }

    // Create order with all fields
    const orderResult = await db.runAsync(
      `INSERT INTO orders (order_user_id, order_customer_name, order_customer_email, order_total, order_status) VALUES (?, ?, ?, ?, ?)`,
      [user_id, customer_name, customer_email, total.toFixed(2), "processing"]
    );
    const orderId = orderResult.lastID;

    // Create order_items
    for (const detail of productDetails) {
      await db.runAsync(
        `INSERT INTO order_items (order_item_order_id, order_item_product_id, order_item_product_name, order_item_quantity, order_item_price) VALUES (?, ?, ?, ?, ?)`,
        [
          orderId,
          detail.product_id,
          detail.product_name,
          detail.quantity,
          detail.product_price,
        ]
      );

      // Decrease product stock by the ordered quantity
      await db.runAsync(
        `UPDATE products SET product_stock = product_stock - ? WHERE product_id = ?`,
        [detail.quantity, detail.product_id]
      );
    }

    // Create payment record
    const paymentResult = await db.runAsync(
      `INSERT INTO payments (payment_order_id, payment_amount, payment_method, payment_status) VALUES (?, ?, ?, ?)`,
      [orderId, total.toFixed(2), method_hint || "gcash", "completed"]
    );
    const paymentId = paymentResult.lastID;

    // Link payment to order
    try {
      await db.runAsync("UPDATE orders SET payment_id = ? WHERE order_id = ?", [
        paymentId,
        orderId,
      ]);
    } catch (e) {}

    // Cleanup OTP request
    await db.runAsync("DELETE FROM otp_requests WHERE otp_id = ?", [requestId]);

    // Fetch complete order for response
    const createdOrder = await db.getAsync(
      "SELECT o.*, u.user_username, u.user_email FROM orders o LEFT JOIN users u ON o.order_user_id = u.user_id WHERE o.order_id = ?",
      [orderId]
    );
    const createdItems = await db.allAsync(
      "SELECT * FROM order_items WHERE order_item_order_id = ?",
      [orderId]
    );
    const latestPayment = await db.getAsync(
      "SELECT * FROM payments WHERE payment_order_id = ? ORDER BY payment_id DESC LIMIT 1",
      [orderId]
    );

    // Build response with normalized fields
    const orderResponse = {
      ...createdOrder,
      items: createdItems,
      payment: latestPayment || null,
      payment_id: paymentId,
      orderNumber: orderId,
      id: orderId,
      customer_name: customer_name || "Guest",
      customer_email: customer_email || "",
      payment_method: method_hint || "gcash",
      subtotal: total,
      tax: 0,
      total: total,
    };

    const fakeLink = return_url
      ? `${return_url}?orderId=${orderId}&paymentId=${paymentId}`
      : null;

    console.log(
      "confirm-otp success - orderId:",
      orderId,
      "paymentId:",
      paymentId,
      "items:",
      createdItems.length
    );

    res.json({
      order: orderResponse,
      orderId,
      paymentId,
      payment_link: fakeLink,
      requestId,
    });
  } catch (err) {
    console.error("confirm-otp error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook receiver (provider will POST here). Provider-specific signature verification should be added when integrating.
router.post("/webhook", async (req, res) => {
  try {
    const event = req.body;

    // Example expected webhook shape: { type: 'payment.paid', data: { payment_id, order_id, provider_txn_id, amount } }
    if (event && event.type === "payment.paid" && event.data) {
      const { payment_id, order_id, provider_txn_id, amount } = event.data;
      await db.runAsync(
        "UPDATE payments SET payment_status = ?, payment_provider_txn_id = ? WHERE payment_id = ?",
        ["completed", provider_txn_id || null, payment_id]
      );
      await db.runAsync(
        "UPDATE orders SET order_status = ? WHERE order_id = ?",
        ["processing", order_id]
      );
    }

    // Respond quickly to acknowledge
    res.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).end();
  }
});

// Optional: read payment
router.get("/:id", async (req, res) => {
  try {
    const payment = await db.getAsync(
      "SELECT * FROM payments WHERE payment_id = ?",
      [req.params.id]
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
