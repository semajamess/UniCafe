# UniCafe Backend Server

Express.js + SQLite3 backend for UniCafe management system.

## Features

✅ **3 API Integrations:**
- Coffee API - Auto-seeds coffee products
- BobaDex/Milk Tea API - Bubble tea varieties  
- Dessert API - Pastries and desserts

✅ **Database (SQLite3):**
- Easy customer access with simple queries
- Products, Orders, Categories, Customers
- Normalized schema with foreign keys

✅ **RESTful API Endpoints:**
- Full CRUD for all resources
- Customer-accessible endpoints for ordering
- Admin-only endpoints for management

## Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Server runs on `http://localhost:3000`

### 3. Auto-Seeding
Database automatically seeds on first run with:
- 15+ Coffee products
- 8+ Milk Tea products
- 8+ Pastry products

## API Endpoints

### Public (Customer Accessible)

**Products**
- `GET /api/products` - Get all products
- `GET /api/products?category=Coffee` - Filter by category
- `GET /api/products?available=true` - Only available products
- `GET /api/products/:id` - Get single product

**Categories**
- `GET /api/categories` - Get all categories

**Orders**
- `POST /api/orders` - Create new order
  ```json
  {
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "items": [
      { "product_id": 1, "quantity": 2 },
      { "product_id": 3, "quantity": 1 }
    ]
  }
  ```
- `GET /api/orders?customer_email=user@email.com` - Track orders by email
- `GET /api/orders/:id` - Get order details with items

### Admin Only

**Products**
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/api/search?q=latte` - Search Coffee API for ideas

**Categories**
- `POST /api/categories` - Add category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

**Orders**
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status
  ```json
  { "status": "processing" }
  ```
- `DELETE /api/orders/:id` - Delete order
- `GET /api/orders/stats/revenue?period=week` - Revenue statistics

## Database Schema

### Products Table
```sql
id, category_id, name, description, price, image_url, is_available, created_at
```

### Orders Table (Easy Customer Access)
```sql
id, customer_id, customer_name, customer_email, customer_phone, total, status, created_at
```

### Order Items Table
```sql
id, order_id, product_id, product_name, quantity, price
```

## Customer Access Design

**Why it's easy for customer side:**
1. **No authentication required for browsing** - Products/categories are public
2. **Email-based order tracking** - Customers can check orders with just email
3. **Simple order creation** - Just send product IDs and quantities
4. **Clear responses** - All data includes necessary details (category names, etc.)

## Environment Variables

Create `.env` file:
```
PORT=3000
JWT_SECRET=your-secret-key
NODE_ENV=development
```

## File Structure
```
backend/
├── server.js           # Main server file
├── database.js         # Database setup & schema
├── package.json        # Dependencies
├── .env               # Environment variables
├── routes/
│   ├── categories.js  # Category endpoints
│   ├── products.js    # Product endpoints
│   └── orders.js      # Order endpoints
└── services/
    └── apiService.js  # External API integrations
```

## Testing Endpoints

Use Postman, Thunder Client, or curl:

```bash
# Get all products
curl http://localhost:3000/api/products

# Get coffee products only
curl http://localhost:3000/api/products?category=Coffee

# Create an order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com", 
    "customer_phone": "+1234567890",
    "items": [{"product_id": 1, "quantity": 2}]
  }'

# Track order by email
curl http://localhost:3000/api/orders?customer_email=test@example.com
```

## Notes

- Database file: `unicafe.db` (auto-created)
- CORS enabled for frontend connection
- Auto-seeds from APIs on first run
- All customer endpoints are public for easy access
