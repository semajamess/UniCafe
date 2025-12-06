import nodemailer from "nodemailer";

let transporter;

async function initTransporter() {
  if (transporter) return transporter;

  // If SMTP env vars are provided, use them; otherwise create an Ethereal test account
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    // Verify transporter connectivity/config so errors are easier to diagnose
    try {
      await transporter.verify();
      console.log(
        "SMTP transporter verified (using host",
        process.env.SMTP_HOST + ")"
      );
    } catch (err) {
      console.error(
        "SMTP transporter verification failed:",
        err && err.message ? err.message : err
      );
    }

    return transporter;
  }

  // No SMTP configured — create Ethereal test account for local development
  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log(
    "Ethereal account created. Preview URL will be logged for sent messages."
  );
  return transporter;
}

export async function sendOtpEmail(to, otp, orderId) {
  try {
    const t = await initTransporter();
    const from = process.env.FROM_EMAIL || "no-reply@unicafe.local";
    const subject = `UniCafe demo OTP for order #${orderId}`;
    const text = `Your demo OTP is ${otp}. Use this to complete your payment for order #${orderId}.`;
    const html = `<p>Your demo OTP is <strong>${otp}</strong></p><p>Order: ${orderId}</p>`;

    const info = await t.sendMail({ from, to, subject, text, html });

    // If using Ethereal, provide preview URL in logs
    if (nodemailer.getTestMessageUrl && info) {
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) console.log("OTP email preview URL:", preview);
    }

    return info;
  } catch (err) {
    console.error("sendOtpEmail error:", err);
    throw err;
  }
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
  messageId,
}) {
  try {
    const t = await initTransporter();
    const from = process.env.FROM_EMAIL || "no-reply@unicafe.local";
    const supportEmail =
      process.env.SUPPORT_EMAIL || "jamesandrew.ocuaman@wvsu.edu.ph";

    // Email to support team
    const supportEmailText = `New contact message from ${name} (${email})\n\nSubject: ${subject}\n\nMessage:\n${message}\n\nMessage ID: ${messageId}`;
    const supportEmailHtml = `
      <h3>New Contact Message</h3>
      <p><strong>From:</strong> ${name} (${email})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <p><em>Message ID: ${messageId}</em></p>
    `;

    // Send to support team
    const supportInfo = await t.sendMail({
      from,
      to: supportEmail,
      subject: `[UniCafe Contact] ${subject}`,
      text: supportEmailText,
      html: supportEmailHtml,
    });

    // Confirmation email to customer
    const customerEmailText = `Hi ${name},\n\nThank you for contacting UniCafe! We have received your message and will get back to you as soon as possible.\n\nYour message ID: ${messageId}\n\nBest regards,\nUniCafe Team`;
    const customerEmailHtml = `
      <p>Hi ${name},</p>
      <p>Thank you for contacting UniCafe! We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message ID:</strong> ${messageId}</p>
      <p>Best regards,<br>UniCafe Team</p>
    `;

    const customerInfo = await t.sendMail({
      from,
      to: email,
      subject: "We received your message - UniCafe",
      text: customerEmailText,
      html: customerEmailHtml,
    });

    // If using Ethereal, provide preview URLs in logs
    if (nodemailer.getTestMessageUrl) {
      if (supportInfo) {
        const preview = nodemailer.getTestMessageUrl(supportInfo);
        if (preview) console.log("Support email preview URL:", preview);
      }
      if (customerInfo) {
        const preview = nodemailer.getTestMessageUrl(customerInfo);
        if (preview)
          console.log("Customer confirmation email preview URL:", preview);
      }
    }

    return { supportInfo, customerInfo };
  } catch (err) {
    console.error("sendContactEmail error:", err);
    throw err;
  }
}
