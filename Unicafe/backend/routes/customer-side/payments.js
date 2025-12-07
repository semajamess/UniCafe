import express from "express";
import db from "../../database.js";
import { authenticateToken } from "./auth.js";
import { sendOtpEmail } from "../../services/emailService.js";
import { sendOtpSms, maskPhoneNumber } from "../../services/smsService.js";
import bodyParser from "body-parser";
import { createNotification } from "../cafe-side/notifications.js";

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Provider-agnostic: create a payment link for an order
router.post("/create-link", authenticateToken, async (req, res) => {
  try {
    const { items, return_url, cancel_url, method_hint, require_otp } =
      req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;
    let customer_name =
      req.user && req.user.username ? req.user.username : null;
    let customer_email = req.user && req.user.email ? req.user.email : null;

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
        // ignore lookup errors
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

    // Create order
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

    // Create order_items
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

    // Create payments record
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

    try {
      await db.runAsync("UPDATE orders SET payment_id = ? WHERE order_id = ?", [
        paymentId,
        orderId,
      ]);
    } catch (e) {
      // ignore if column not present
    }

    const otpParam = require_otp ? "&otp=1" : "";
    const fakeLink = `${req.protocol}://${req.get(
      "host"
    )}/api/customer/payments/redirect-simulate?payment_id=${paymentId}&order_id=${orderId}&return_url=${encodeURIComponent(
      return_url || ""
    )}${otpParam}`;

    res.json({ payment_link: fakeLink, orderId, paymentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Simulate redirect
router.get("/redirect-simulate", async (req, res) => {
  try {
    const { payment_id, order_id, return_url } = req.query;
    const useOtp = req.query.otp === "1" || req.query.otp === "true";

    if (useOtp) {
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

      const html = `<!doctype html>
<html>
  <head><meta charset="utf-8"><title>OTP Verification (Demo)</title></head>
  <body>
    <h2>Demo OTP Sent</h2>
    <p>For this demo the OTP is shown here: <strong>${otp}</strong></p>
    <form method="POST" action="/api/customer/payments/verify-otp">
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

    res.json({ message: "Simulated payment complete", order_id, payment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { payment_id, order_id, otp, return_url } = req.body || {};
    if (!payment_id || !order_id || !otp)
      return res
        .status(400)
        .json({ error: "payment_id, order_id and otp are required" });

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

// Initiate OTP - supports both email (bank_transfer) and SMS (e_wallet)
router.post("/initiate-otp", authenticateToken, async (req, res) => {
  try {
    const { items, return_url, method_hint, otp_channel } = req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ error: "items required" });

    // Determine OTP channel: 'sms' for e_wallet, 'email' for bank_transfer (default)
    // Support both 'e_wallet' and 'ewallet' formats
    const isEwallet = method_hint === "e_wallet" || method_hint === "ewallet";
    const channel = otp_channel || (isEwallet ? "sms" : "email");

    console.log("Payment method_hint:", method_hint, "| Channel:", channel);

    // Get user details including phone
    let userEmail = req.user.email || null;
    let userPhone = req.user.phone || null;

    if (user_id && !userPhone) {
      try {
        const u = await db.getAsync(
          "SELECT user_email, user_phone FROM users WHERE user_id = ?",
          [user_id]
        );
        if (u) {
          userEmail = u.user_email || userEmail;
          userPhone = u.user_phone || null;
        }
      } catch (e) {}
    }

    // Validate that we have the right contact info for the channel
    if (channel === "sms" && !userPhone) {
      return res.status(400).json({
        error:
          "Phone number required for E-Wallet payment. Please update your profile.",
      });
    }
    if (channel === "email" && !userEmail) {
      return res
        .status(400)
        .json({ error: "Email required for Bank Transfer payment." });
    }

    // Build payload to persist (stringified)
    const payload = JSON.stringify({
      items,
      return_url: return_url || null,
      method_hint: method_hint || null,
      user_id,
      otp_channel: channel,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Insert OTP request
    const insertSql = `INSERT INTO otp_requests (otp_email, otp_code, otp_payload, otp_attempts, otp_expires_at) VALUES (?, ?, ?, ?, ?)`;
    const recipient = channel === "sms" ? userPhone : userEmail;
    const insertRes = await db.runAsync(insertSql, [
      recipient,
      otp,
      payload,
      0,
      expiresAt.toISOString(),
    ]);
    const requestId = insertRes.lastID;

    // Send OTP via appropriate channel
    let sendResult = null;
    if (channel === "sms") {
      try {
        sendResult = await sendOtpSms(userPhone, otp, requestId);
        console.log("SMS OTP sent to:", maskPhoneNumber(userPhone));
      } catch (e) {
        console.warn("OTP SMS send failed:", e.message || e);
      }
    } else {
      try {
        await sendOtpEmail(userEmail, otp, requestId);
        console.log("Email OTP sent to:", userEmail);
      } catch (e) {
        console.warn("OTP email send failed:", e.message || e);
      }
    }

    res.json({
      requestId,
      otp_channel: channel,
      otp_sent_to: channel === "sms" ? maskPhoneNumber(userPhone) : userEmail,
      otp_demo: otp, // For testing only - remove in production
    });
  } catch (err) {
    console.error("initiate-otp error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Confirm OTP
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

    if (new Date(reqRow.otp_expires_at) < new Date()) {
      return res.status(400).json({ error: "OTP has expired" });
    }

    // Check attempt limit first (max 5 attempts)
    if (reqRow.otp_attempts >= 5) {
      return res
        .status(400)
        .json({ error: "Too many OTP attempts. Request new OTP" });
    }

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

    const { items, method_hint } = payload;
    const user_id = req.user && req.user.id ? req.user.id : null;

    // Calculate total from products in database
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

    // Get customer info from user
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

    // Create order with all required fields
    const orderResult = await db.runAsync(
      `INSERT INTO orders (order_user_id, order_customer_name, order_customer_email, order_total, order_status) VALUES (?, ?, ?, ?, ?)`,
      [user_id, customer_name, customer_email, total.toFixed(2), "processing"]
    );
    const orderId = orderResult.lastID;

    // Create order items and decrease stock
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
      [orderId, total.toFixed(2), method_hint || "bank_transfer", "completed"]
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

    // Fetch the complete order with all details
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

    // Build normalized response for frontend
    const orderResponse = {
      ...createdOrder,
      items: createdItems,
      payment: latestPayment || null,
      payment_id: paymentId,
      // Add normalized fields for receipt
      orderNumber: orderId,
      id: orderId,
      customer_name: customer_name || "Guest",
      customer_email: customer_email || "",
      payment_method: method_hint || "bank_transfer",
      subtotal: total,
      tax: 0,
      total: total,
    };

    console.log(
      "confirm-otp success - orderId:",
      orderId,
      "paymentId:",
      paymentId,
      "items:",
      createdItems.length
    );

    // Emit real-time notification to cafe admins
    const io = req.app.get("io");
    if (io) {
      await createNotification(io, {
        type: "new_order",
        title: "New Order Received",
        message: `Order #${orderId} - ₱${total.toFixed(2)} from ${
          customer_name || customer_email || "Customer"
        }`,
        data: {
          orderId,
          total,
          itemCount: createdItems.length,
          customerName: customer_name || customer_email,
          paymentMethod: method_hint || "bank_transfer",
        },
      });
      console.log("✅ Notification sent for order #" + orderId);
    } else {
      console.warn("⚠️ Socket.IO not available, notification not sent");
    }

    res.json({ order: orderResponse, orderId, paymentId, requestId });
  } catch (err) {
    console.error("confirm-otp error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get payment
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
