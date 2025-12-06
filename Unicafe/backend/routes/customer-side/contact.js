import express from "express";
import db from "../../database.js";
import { sendContactEmail } from "../../services/emailService.js";

const router = express.Router();

/**
 * POST /api/customer/contact
 * Submit a contact message from the contact form
 *
 * Body:
 * {
 *   name: string (required),
 *   email: string (required),
 *   subject: string (required),
 *   message: string (required)
 * }
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: "Missing required fields: name, email, subject, message",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // Save contact message to database
    const result = await db.runAsync(
      `INSERT INTO contact_messages 
       (contact_name, contact_email, contact_subject, contact_message, contact_is_read, contact_created_at) 
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [name, email, subject, message, 0]
    );

    console.log(
      `✅ Contact message received from ${email} - ID: ${result.lastID}`
    );

    // Send email notification to cafe support and acknowledgment to customer
    try {
      await sendContactEmail({
        name,
        email,
        subject,
        message,
        messageId: result.lastID,
      });
      console.log(`✅ Contact confirmation email sent to ${email}`);
    } catch (emailError) {
      console.error("⚠️  Could not send contact email:", emailError.message);
      // Don't fail the request if email fails - message is still saved in DB
    }

    // Return success response
    res.json({
      success: true,
      message: "Your message has been received. We will get back to you soon!",
      messageId: result.lastID,
    });
  } catch (error) {
    console.error("❌ Error submitting contact message:", error);
    res.status(500).json({
      error: "Failed to submit contact message",
    });
  }
});

/**
 * GET /api/customer/contact
 * Retrieve all contact messages (for admin panel)
 * Note: In production, this should be protected by admin authentication
 */
router.get("/", async (req, res) => {
  try {
    const messages = await db.allAsync(
      `SELECT contact_id, contact_name, contact_email, contact_subject, 
              contact_message, contact_is_read, contact_created_at 
       FROM contact_messages 
       ORDER BY contact_created_at DESC`
    );

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("❌ Error retrieving contact messages:", error);
    res.status(500).json({
      error: "Failed to retrieve contact messages",
    });
  }
});

/**
 * PATCH /api/customer/contact/:id
 * Mark a contact message as read
 */
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== "boolean") {
      return res.status(400).json({
        error: "Invalid request: isRead must be a boolean",
      });
    }

    const result = await db.runAsync(
      `UPDATE contact_messages 
       SET contact_is_read = ? 
       WHERE contact_id = ?`,
      [isRead ? 1 : 0, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Contact message not found",
      });
    }

    res.json({
      success: true,
      message: "Contact message updated",
    });
  } catch (error) {
    console.error("❌ Error updating contact message:", error);
    res.status(500).json({
      error: "Failed to update contact message",
    });
  }
});

export default router;
