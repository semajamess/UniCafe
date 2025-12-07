import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import db, { initDatabase } from "./database.js";
import {
  seedDrinkProducts,
  seedPastryProducts,
} from "./services/apiService.js";

// Import customer-side routes
import customerAuthRoutes from "./routes/customer-side/auth.js";
import customerProductsRoutes from "./routes/customer-side/products.js";
import customerCategoriesRoutes from "./routes/customer-side/categories.js";
import customerOrdersRoutes from "./routes/customer-side/orders.js";
import customerPaymentsRoutes from "./routes/customer-side/payments.js";
import customerContactRoutes from "./routes/customer-side/contact.js";
import customerSettingsRoutes from "./routes/customer-side/settings.js";

// Import cafe-side routes
import cafeProductsRoutes from "./routes/cafe-side/products.js";
import cafeOrdersRoutes from "./routes/cafe-side/orders.js";
import cafeCustomersRoutes from "./routes/cafe-side/customers.js";
import cafePaymentsRoutes from "./routes/cafe-side/payments.js";
import cafeStatsRoutes from "./routes/cafe-side/stats.js";
import cafePosRoutes from "./routes/cafe-side/pos.js";
import cafeAuthRoutes from "./routes/cafe-side/auth.js";
import cafeSettingsRoutes from "./routes/cafe-side/settings.js";
import cafeNotificationsRoutes from "./routes/cafe-side/notifications.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Socket.IO setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible to routes
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Join cafe admin room for targeted notifications
  socket.on("join-cafe", () => {
    socket.join("cafe-admins");
    console.log("☕ Admin joined cafe-admins room:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "UniCafe Backend API",
    version: "1.0.0",
    status: "running",
  });
});

// API Routes - Customer Side
app.use("/api/auth", customerAuthRoutes);
app.use("/api/customer/auth", customerAuthRoutes);
app.use("/api/customer/categories", customerCategoriesRoutes);
app.use("/api/customer/products", customerProductsRoutes);
app.use("/api/customer/orders", customerOrdersRoutes);
app.use("/api/customer/payments", customerPaymentsRoutes);
app.use("/api/customer/contact", customerContactRoutes);
app.use("/api/customer/settings", customerSettingsRoutes);

// API Routes - Cafe Side (Admin)
app.use("/api/cafe/auth", cafeAuthRoutes);
app.use("/api/cafe/products", cafeProductsRoutes);
app.use("/api/cafe/orders", cafeOrdersRoutes);
app.use("/api/cafe/customers", cafeCustomersRoutes);
app.use("/api/cafe/payments", cafePaymentsRoutes);
app.use("/api/cafe/stats", cafeStatsRoutes);
app.use("/api/cafe/pos", cafePosRoutes);
app.use("/api/cafe/settings", cafeSettingsRoutes);
app.use("/api/cafe/notifications", cafeNotificationsRoutes);

// Seed database endpoint (for initial setup)
app.post("/api/seed", async (req, res) => {
  try {
    const productCount = await db.getAsync(
      "SELECT COUNT(*) as count FROM products"
    );

    if (productCount.count === 0) {
      await seedDrinkProducts();
      await seedPastryProducts();
      res.json({
        message: "Database seeded successfully with products from APIs",
      });
    } else {
      res.json({
        message: "Database already has products. No seeding needed.",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();

    // Auto-seed on first run
    const productCount = await db.getAsync(
      "SELECT COUNT(*) as count FROM products"
    );
    if (productCount.count === 0) {
      console.log("📦 Seeding database with products from APIs...");
      try {
        await seedDrinkProducts();
        await seedPastryProducts();
        console.log("✅ Database seeded successfully!");
      } catch (seedError) {
        console.error("❌ Seeding error:", seedError.message);
        console.error(seedError.stack);
      }
    }

    httpServer.listen(PORT, () => {
      console.log("\n🚀 ========================================");
      console.log(`   UniCafe Backend Server Running!`);
      console.log(`   Port: ${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log(`   WebSocket: ws://localhost:${PORT}`);
      console.log("========================================\n");
      console.log("📡 Available Endpoints:");
      console.log("   GET  /api/categories");
      console.log("   GET  /api/products");
      console.log("   GET  /api/products?category=Coffee");
      console.log("   GET  /api/products/api/search?q=latte");
      console.log("   POST /api/orders");
      console.log("   GET  /api/orders?customer_email=user@example.com");
      console.log("   POST /api/seed (manual seed trigger)");
      console.log("   🔔 Real-time notifications enabled!");
      console.log("\n✨ Ready for frontend connection!\n");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
