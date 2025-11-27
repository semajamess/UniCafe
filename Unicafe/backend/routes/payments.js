import express from 'express';
import db from '../database.js';
import { authenticateToken } from './auth.js';
import { sendOtpEmail } from '../services/emailService.js';
import bodyParser from 'body-parser';

const router = express.Router();

// allow form POST from demo HTML
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Provider-agnostic: create a payment link for an order
router.post('/create-link', authenticateToken, async (req, res) => {
  try {
    const { items, return_url, cancel_url, method_hint, require_otp } = req.body;
    // Use authenticated user as canonical source of truth
    const user_id = req.user && req.user.id ? req.user.id : null;
    let customer_name = req.user && req.user.username ? req.user.username : null;
    let customer_email = req.user && req.user.email ? req.user.email : null;

    // If we have a user_id but no explicit customer name/email, resolve from users table
    if (user_id && (!customer_name || !customer_email)) {
      try {
        const u = await db.getAsync('SELECT username, email FROM users WHERE id = ?', [user_id]);
        if (u) {
          if (!customer_name && u.username) customer_name = u.username;
          if (!customer_email && u.email) customer_email = u.email;
        }
      } catch (e) {
        // ignore lookup errors — insertion will still proceed with whatever data available
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items are required' });
    }

    // Calculate total
    let total = 0;
    for (const it of items) {
      const p = await db.getAsync('SELECT * FROM products WHERE id = ?', [it.product_id]);
      if (!p) return res.status(404).json({ error: `Product ${it.product_id} not found` });
      total += p.price * it.quantity;
    }

    // Create order as pending (we'll attach items on payment webhook or after redirect depending on flow)
    // Be defensive: some DBs may not have the newer columns (migrations not run). Check available columns
    const info = await db.allAsync("PRAGMA table_info(orders)");
    const cols = info.map(c => c.name);
    const insertCols = [];
    const params = [];

    if (cols.includes('user_id')) { insertCols.push('user_id'); params.push(user_id || null); }
    if (cols.includes('customer_name')) { insertCols.push('customer_name'); params.push(customer_name || null); }
    if (cols.includes('customer_email')) { insertCols.push('customer_email'); params.push(customer_email || null); }
    if (cols.includes('total')) { insertCols.push('total'); params.push(total.toFixed(2)); }
    if (cols.includes('status')) { insertCols.push('status'); params.push('pending'); }

    if (insertCols.length === 0) {
      throw new Error('Orders table has no writable columns for insert')
    }

    const placeholders = insertCols.map(() => '?').join(',');
    const sql = `INSERT INTO orders (${insertCols.join(',')}) VALUES (${placeholders})`;
    const orderRes = await db.runAsync(sql, params);
    const orderId = orderRes.lastID;

    // Create order_items immediately to keep consistency
    for (const it of items) {
      const p = await db.getAsync('SELECT * FROM products WHERE id = ?', [it.product_id]);
      await db.runAsync(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [orderId, p.id, p.name, it.quantity, p.price]
      );
    }

    // Create payments record with status pending
    // Defensive: only insert columns that exist in the payments table (older DBs may lack 'metadata')
    const payInfo = await db.allAsync("PRAGMA table_info(payments)");
    const payCols = payInfo.map(c => c.name);
    const payInsertCols = [];
    const payParams = [];

    if (payCols.includes('order_id')) { payInsertCols.push('order_id'); payParams.push(orderId); }
    if (payCols.includes('amount')) { payInsertCols.push('amount'); payParams.push(total.toFixed(2)); }
    if (payCols.includes('method')) { payInsertCols.push('method'); payParams.push(method_hint || null); }
    if (payCols.includes('status')) { payInsertCols.push('status'); payParams.push('pending'); }
    if (payCols.includes('metadata')) { payInsertCols.push('metadata'); payParams.push(null); }

    if (payInsertCols.length === 0) {
      throw new Error('Payments table has no writable columns for insert')
    }

    const payPlaceholders = payInsertCols.map(() => '?').join(',');
    const paySql = `INSERT INTO payments (${payInsertCols.join(',')}) VALUES (${payPlaceholders})`;
    const paymentRes = await db.runAsync(paySql, payParams);
    const paymentId = paymentRes.lastID;

    // Attach payment_id to order if column present
    try {
      await db.runAsync('UPDATE orders SET payment_id = ? WHERE id = ?', [paymentId, orderId]);
    } catch (e) {
      // ignore if column not present
    }

    // Build a fake provider link for sandbox/dev: in production this will call the provider API
    // If client requested OTP flow, return a link that starts the OTP flow.
    // Note: for OTP-backed flow we may prefer to initiate OTP before persisting; see /initiate-otp
    const otpParam = require_otp ? '&otp=1' : '';
    const fakeLink = `${req.protocol}://${req.get('host')}/api/payments/redirect-simulate?payment_id=${paymentId}&order_id=${orderId}&return_url=${encodeURIComponent(return_url || '')}${otpParam}`;

    res.json({ payment_link: fakeLink, orderId, paymentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Simulate redirect (for sandbox/dev) - this simulates the provider redirecting back after payment
router.get('/redirect-simulate', async (req, res) => {
  try {
    const { payment_id, order_id, return_url } = req.query;

    // If otp query flag is present, generate and show OTP verification form
    const useOtp = req.query.otp === '1' || req.query.otp === 'true';

    if (useOtp) {
      // generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const metadata = JSON.stringify({ otp, sent_at: new Date().toISOString() });
      try {
        await db.runAsync('UPDATE payments SET metadata = ? WHERE id = ?', [metadata, payment_id]);
      } catch (e) {
        // ignore if metadata column missing
      }

      // Try to resolve a recipient email: prefer order.customer_email, else lookup user email
      let recipient = null;
      try {
        const orderRow = await db.getAsync('SELECT customer_email, user_id FROM orders WHERE id = ?', [order_id]);
        if (orderRow && orderRow.customer_email) recipient = orderRow.customer_email;
        else if (orderRow && orderRow.user_id) {
          const user = await db.getAsync('SELECT email FROM users WHERE id = ?', [orderRow.user_id]);
          if (user && user.email) recipient = user.email;
        }
      } catch (e) {
        // ignore lookup errors
      }

      // Send email if we have a recipient; keep rendering demo page regardless
      if (recipient) {
        try {
          await sendOtpEmail(recipient, otp, order_id);
        } catch (e) {
          console.warn('Failed to send OTP email (will still render demo page):', e.message || e);
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
      <input type="hidden" name="return_url" value="${return_url || ''}" />
      <label>Enter OTP: <input name="otp" /></label>
      <button type="submit">Verify OTP</button>
    </form>
  </body>
</html>`;

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    // Default behavior: immediately complete payment (no OTP)
    // Mark payment completed
    await db.runAsync('UPDATE payments SET status = ?, provider_txn_id = ? WHERE id = ?', ['completed', `SIM-${Date.now()}`, payment_id]);

    // Update order status
    await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', ['processing', order_id]);

    if (return_url) {
      // Redirect back to app (client handles confirmation)
      return res.redirect(return_url + `?orderId=${order_id}&paymentId=${payment_id}`);
    }

    res.json({ message: 'Simulated payment complete', order_id, payment_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP (demo). Expects form-encoded or JSON body with { payment_id, order_id, otp, return_url }
router.post('/verify-otp', async (req, res) => {
  try {
    const { payment_id, order_id, otp, return_url } = req.body || {};
    if (!payment_id || !order_id || !otp) return res.status(400).json({ error: 'payment_id, order_id and otp are required' });

    // Read payment metadata
    const payment = await db.getAsync('SELECT * FROM payments WHERE id = ?', [payment_id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    let metadata = null;
    try { metadata = payment.metadata ? JSON.parse(payment.metadata) : null; } catch (e) { metadata = null; }

    if (!metadata || metadata.otp !== String(otp)) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP valid -> mark payment and order completed
    await db.runAsync('UPDATE payments SET status = ?, provider_txn_id = ? WHERE id = ?', ['completed', `SIM-${Date.now()}`, payment_id]);
    await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', ['processing', order_id]);

    if (return_url) {
      return res.redirect(return_url + `?orderId=${order_id}&paymentId=${payment_id}`);
    }

    res.json({ message: 'OTP verified, payment completed', order_id, payment_id });
  } catch (err) {
    console.error('verify-otp error:', err);
    res.status(500).json({ error: err.message });
  }
});

// New: initiate OTP-backed payment WITHOUT creating order/payment records yet.
// Expects: { items, return_url, method_hint }
// Returns: { requestId }
router.post('/initiate-otp', authenticateToken, async (req, res) => {
  try {
    const { items, return_url, method_hint } = req.body;
    const user_id = req.user && req.user.id ? req.user.id : null;

    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items required' });

    // Build payload to persist (stringified)
    const payload = { items, return_url: return_url || null, method_hint: method_hint || null, user_id };

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // insert into otp_requests
    const insertSql = `INSERT INTO otp_requests (otp, payload) VALUES (?, ?)`;
    const insertRes = await db.runAsync(insertSql, [otp, JSON.stringify(payload)]);
    const requestId = insertRes.lastID;

    // try to determine recipient email
    let recipient = null;
    try {
      if (user_id) {
        const u = await db.getAsync('SELECT email FROM users WHERE id = ?', [user_id]);
        if (u && u.email) recipient = u.email;
      }
    } catch (e) {}

    if (recipient) {
      try { await sendOtpEmail(recipient, otp, requestId); } catch (e) { console.warn('OTP email send failed:', e.message || e); }
    } else {
      console.log('No recipient for OTP request', requestId);
    }

    res.json({ requestId });
  } catch (err) {
    console.error('initiate-otp error:', err);
    res.status(500).json({ error: err.message });
  }
});

// New: confirm OTP-backed payment. Expects { requestId, otp }
// On success: creates order, order_items, payments and returns { orderId, paymentId, payment_link }
router.post('/confirm-otp', authenticateToken, async (req, res) => {
  try {
    const { requestId, otp } = req.body || {};
    if (!requestId || !otp) return res.status(400).json({ error: 'requestId and otp required' });

    const reqRow = await db.getAsync('SELECT * FROM otp_requests WHERE id = ?', [requestId]);
    if (!reqRow) return res.status(404).json({ error: 'OTP request not found' });

    if (String(reqRow.otp) !== String(otp)) {
      await db.runAsync('UPDATE otp_requests SET attempts = attempts + 1 WHERE id = ?', [requestId]);
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // parse payload and create order/payment as in create-link
    const payload = JSON.parse(reqRow.payload);
    const { items, return_url, method_hint, user_id } = payload;

    // Calculate total and create order
    let total = 0;
    for (const it of items) {
      const p = await db.getAsync('SELECT * FROM products WHERE id = ?', [it.product_id]);
      if (!p) return res.status(404).json({ error: `Product ${it.product_id} not found` });
      total += p.price * it.quantity;
    }

    const info = await db.allAsync("PRAGMA table_info(orders)");
    const cols = info.map(c => c.name);
    const insertCols = [];
    const params = [];
    if (cols.includes('user_id')) { insertCols.push('user_id'); params.push(user_id || null); }
    if (cols.includes('total')) { insertCols.push('total'); params.push(total.toFixed(2)); }
    if (cols.includes('status')) { insertCols.push('status'); params.push('pending'); }
    if (cols.includes('customer_name') || cols.includes('customer_email')) {
      // try to resolve from users table
      let cname = null, cemail = null;
      if (user_id) {
        const u = await db.getAsync('SELECT username,email FROM users WHERE id = ?', [user_id]);
        if (u) { cname = u.username; cemail = u.email; }
      }
      if (cols.includes('customer_name')) { insertCols.push('customer_name'); params.push(cname); }
      if (cols.includes('customer_email')) { insertCols.push('customer_email'); params.push(cemail); }
    }

    const placeholders = insertCols.map(() => '?').join(',');
    const sql = `INSERT INTO orders (${insertCols.join(',')}) VALUES (${placeholders})`;
    const orderRes = await db.runAsync(sql, params);
    const orderId = orderRes.lastID;

    // order_items
    for (const it of items) {
      const p = await db.getAsync('SELECT * FROM products WHERE id = ?', [it.product_id]);
      await db.runAsync(
        `INSERT INTO order_items (order_id, product_id, product_name, quantity, price) VALUES (?, ?, ?, ?, ?)`,
        [orderId, p.id, p.name, it.quantity, p.price]
      );
    }

    // payments
    const payInfo = await db.allAsync("PRAGMA table_info(payments)");
    const payCols = payInfo.map(c => c.name);
    const payInsertCols = [];
    const payParams = [];
    if (payCols.includes('order_id')) { payInsertCols.push('order_id'); payParams.push(orderId); }
    if (payCols.includes('amount')) { payInsertCols.push('amount'); payParams.push(total.toFixed(2)); }
    if (payCols.includes('method')) { payInsertCols.push('method'); payParams.push(method_hint || null); }
    if (payCols.includes('status')) { payInsertCols.push('status'); payParams.push('completed'); }
    if (payCols.includes('metadata')) { payInsertCols.push('metadata'); payParams.push(null); }
    const payPlaceholders = payInsertCols.map(() => '?').join(',');
    const paySql = `INSERT INTO payments (${payInsertCols.join(',')}) VALUES (${payPlaceholders})`;
    const paymentRes = await db.runAsync(paySql, payParams);
    const paymentId = paymentRes.lastID;

    // attach payment_id to order if column exists
    try { await db.runAsync('UPDATE orders SET payment_id = ? WHERE id = ?', [paymentId, orderId]); } catch (e) {}

    // cleanup otp_requests
    await db.runAsync('DELETE FROM otp_requests WHERE id = ?', [requestId]);

    // Build fake link as before
    const fakeLink = `${req.protocol}://${req.get('host')}/api/payments/redirect-simulate?payment_id=${paymentId}&order_id=${orderId}&return_url=${encodeURIComponent(return_url || '')}`;

    // Fetch the canonical created order and its items so the client can render the receipt immediately
    const createdOrder = await db.getAsync(
      'SELECT o.*, u.username AS username, u.email AS user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?',
      [orderId]
    );
    const createdItems = await db.allAsync('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const latestPayment = await db.getAsync('SELECT * FROM payments WHERE order_id = ? ORDER BY id DESC LIMIT 1', [orderId]);

    const normalized = {
      ...createdOrder,
      customer_name: createdOrder && createdOrder.username ? createdOrder.username : (createdOrder && createdOrder.customer_name ? createdOrder.customer_name : null),
      customer_email: createdOrder && createdOrder.user_email ? createdOrder.user_email : (createdOrder && createdOrder.customer_email ? createdOrder.customer_email : null),
      items: createdItems || [],
      payment: latestPayment || null,
      payment_id: latestPayment ? latestPayment.id : null
    };

    // Build a receipt-shaped object matching what OrderConfirmation expects
    const itemsForReceipt = (normalized.items || []).map(i => ({
      product_id: i.product_id || i.id,
      product_name: i.product_name || i.name || `Product #${i.product_id || i.id}`,
      quantity: i.quantity || 1,
      price: parseFloat(i.price || 0)
    }));

    const subtotal = itemsForReceipt.reduce((s, it) => s + (it.price * it.quantity), 0);
    const receiptTotal = parseFloat(normalized.total || total || subtotal);

    const built = {
      id: normalized.id,
      orderNumber: normalized.id,
      customer_name: normalized.customer_name || 'Guest',
      customer_email: normalized.customer_email || '',
      payment_method: (normalized.payment && normalized.payment.method) || (latestPayment && latestPayment.method) || 'N/A',
      items: itemsForReceipt,
      subtotal,
      tax: 0,
      total: receiptTotal
    };

    // Log the built receipt for easier debugging (dev only)
    try {
      console.log('confirm-otp built receipt:', JSON.stringify(built))
    } catch (e) {}

    // Return the built receipt object under several keys to be robust for clients
    res.json({ order: built, orderId, paymentId, payment_link: fakeLink, orderData: built, receipt: built });
  } catch (err) {
    console.error('confirm-otp error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Webhook receiver (provider will POST here). Provider-specific signature verification should be added when integrating.
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;

    // Example expected webhook shape: { type: 'payment.paid', data: { payment_id, order_id, provider_txn_id, amount } }
    if (event && event.type === 'payment.paid' && event.data) {
      const { payment_id, order_id, provider_txn_id, amount } = event.data;
      await db.runAsync('UPDATE payments SET status = ?, provider_txn_id = ? WHERE id = ?', ['completed', provider_txn_id || null, payment_id]);
      await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', ['processing', order_id]);
    }

    // Respond quickly to acknowledge
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).end();
  }
});

// Optional: read payment
router.get('/:id', async (req, res) => {
  try {
    const payment = await db.getAsync('SELECT * FROM payments WHERE id = ?', [req.params.id]);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

