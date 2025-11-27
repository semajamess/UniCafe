import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db, { initDatabase } from './database.js';
import { seedDrinkProducts, seedPastryProducts } from './services/apiService.js';

// Import routes
import categoriesRoutes from './routes/categories.js';
import productsRoutes from './routes/products.js';
import ordersRoutes from './routes/orders.js';
import authRoutes from './routes/auth.js';
import paymentsRoutes from './routes/payments.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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
app.get('/', (req, res) => {
  res.json({ 
    message: 'UniCafe Backend API', 
    version: '1.0.0',
    status: 'running' 
  });
});

// API Routes
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentsRoutes);

// Seed database endpoint (for initial setup)
app.post('/api/seed', async (req, res) => {
  try {
    const productCount = await db.getAsync('SELECT COUNT(*) as count FROM products');
    
    if (productCount.count === 0) {
      await seedDrinkProducts();
      await seedPastryProducts();
      res.json({ message: 'Database seeded successfully with products from APIs' });
    } else {
      res.json({ message: 'Database already has products. No seeding needed.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    
    // Auto-seed on first run
    const productCount = await db.getAsync('SELECT COUNT(*) as count FROM products');
    if (productCount.count === 0) {
      console.log('📦 Seeding database with products from APIs...');
      try {
        await seedDrinkProducts();
        await seedPastryProducts();
        console.log('✅ Database seeded successfully!');
      } catch (seedError) {
        console.error('❌ Seeding error:', seedError.message);
        console.error(seedError.stack);
      }
    }

    app.listen(PORT, () => {
      console.log('\n🚀 ========================================');
      console.log(`   UniCafe Backend Server Running!`);
      console.log(`   Port: ${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log('========================================\n');
      console.log('📡 Available Endpoints:');
      console.log('   GET  /api/categories');
      console.log('   GET  /api/products');
      console.log('   GET  /api/products?category=Coffee');
      console.log('   GET  /api/products/api/search?q=latte');
      console.log('   POST /api/orders');
      console.log('   GET  /api/orders?customer_email=user@example.com');
      console.log('   POST /api/seed (manual seed trigger)');
      console.log('\n✨ Ready for frontend connection!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
