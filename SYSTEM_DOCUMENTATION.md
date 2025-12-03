# UniCafe System Documentation
## Complete System Proposal & Architecture Guide

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [System Architecture](#system-architecture)
4. [Database Design](#database-design)
5. [Core Functionalities](#core-functionalities)
6. [Module Structure](#module-structure)
7. [Technical Stack](#technical-stack)
8. [API Endpoints](#api-endpoints)
9. [Security & Authentication](#security--authentication)
10. [Deployment & Setup](#deployment--setup)

---

## Executive Summary

**UniCafe** is a comprehensive campus coffee shop management and ordering system designed to streamline operations for both customers and cafe administrators. The system provides a dual-interface platform enabling customers to browse products, place orders, track payments, and view order history, while administrators can manage inventory, monitor sales analytics, and process orders efficiently.

### Key Features
- **Dual-Interface Design**: Separate customer and admin portals
- **Multiple Authentication Methods**: Email/password and Google OAuth
- **Real-time Order Management**: SMS-based OTP verification for payments
- **Comprehensive Analytics**: Dashboard with sales statistics and trends
- **User Profile Management**: Customizable avatars and phone verification
- **Order Tracking**: Complete order history with search and filter capabilities

---

## System Overview

### System Objectives
1. Enable customers to browse and order coffee shop products online
2. Provide administrators with inventory and sales management tools
3. Implement secure payment processing with verification
4. Maintain detailed order and transaction records
5. Generate business analytics and insights

### Target Users
- **Primary Users**: Campus students and staff
- **Secondary Users**: Cafe administrators and staff
- **Tertiary Users**: System administrators

### System Scope
- Product catalog management
- Customer account management
- Order processing and tracking
- Payment handling with OTP verification
- Customer order history
- Administrative dashboard with analytics
- User authentication (local & OAuth)

---

## System Architecture

### Architecture Pattern: Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                          │
│  ┌──────────────────┐        ┌──────────────────────┐  │
│  │  Customer Side   │        │  Cafe Admin Side     │  │
│  │  (React Vite)    │        │  (React Vite)        │  │
│  └──────────────────┘        └──────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST API
┌─────────────────────────────────────────────────────────┐
│              APPLICATION LAYER                           │
│  ┌────────────────────────────────────────────────────┐ │
│  │         Express.js Backend Server                  │ │
│  │  • Route Handlers                                  │ │
│  │  • Business Logic                                  │ │
│  │  • Authentication/Authorization                    │ │
│  │  • Email & SMS Services                            │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │    External Service Integrations (Services)        │ │
│  │  • Google OAuth 2.0 (Authentication)              │ │
│  │  • Semaphore SMS API (OTP Verification)           │ │
│  │  • DiceBear API (Avatar Generation)               │ │
│  │  • TheMealDB API (Food Product Seeding)           │ │
│  │  • TheCocktailDB API (Beverage Seeding)           │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓ SQL Queries
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │    SQLite Database (unicafe.db)                    │ │
│  │  • Users Table                                     │ │
│  │  • Products Table                                  │ │
│  │  • Orders Table                                    │ │
│  │  • Payments Table                                  │ │
│  │  • Order Items Table                               │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
Customer/Admin
      ↓
   React App (Frontend)
      ↓ (HTTP REST Calls)
Express.js API Routes
      ↓
Service Layer (Business Logic)
      ↓
Database (SQLite)
      ↓
External Services & APIs:
├── Google OAuth (Authentication)
├── Semaphore SMS API (OTP Verification)
├── DiceBear API (Avatar Generation)
├── TheMealDB API (Food Products)
└── TheCocktailDB API (Beverage Products)
```

### External Service Integration Points

```
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL APIs & SERVICES                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────┐  ┌──────────────────────┐    │
│  │   Authentication     │  │   Data Seeding       │    │
│  ├──────────────────────┤  ├──────────────────────┤    │
│  │ • Google OAuth       │  │ • TheMealDB API      │    │
│  │   (user login)       │  │   (food products)    │    │
│  │                      │  │ • TheCocktailDB API  │    │
│  │                      │  │   (beverage products)│    │
│  └──────────────────────┘  └──────────────────────┘    │
│           ↑                          ↑                   │
│           │                          │                   │
│   ┌──────────────────────┐  ┌──────────────────────┐   │
│   │  Profile Management  │  │   Payments & Comms   │   │
│   ├──────────────────────┤  ├──────────────────────┤   │
│   │ • DiceBear API       │  │ • Semaphore SMS API  │   │
│   │   (avatar styles)    │  │   (OTP verification) │   │
│   │                      │  │                      │   │
│   └──────────────────────┘  └──────────────────────┘   │
│           ↑                          ↑                   │
│           └──────────────┬───────────┘                   │
│                          ↓                               │
│        Express.js Backend (server.js)                   │
│                          ↓                               │
│        SQLite Database (unicafe.db)                     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Database Design

### Database Schema (Prefixed Column Names)

#### 1. Users Table
```sql
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_username TEXT NOT NULL UNIQUE,
  user_email TEXT NOT NULL UNIQUE,
  user_password TEXT,
  user_phone TEXT,
  user_profile_image TEXT,
  user_google_id TEXT UNIQUE,
  user_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store user account information
**Key Fields**:
- `user_id`: Unique identifier
- `user_username`: Display name
- `user_email`: Login email
- `user_password`: Hashed password (bcrypt)
- `user_phone`: Philippine mobile number (required for e-wallet)
- `user_profile_image`: Avatar URL (DiceBear or Google)
- `user_google_id`: Google OAuth identifier
- `user_created_at`: Account creation timestamp

---

#### 2. Products Table
```sql
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL UNIQUE,
  product_description TEXT,
  product_price REAL NOT NULL,
  product_category TEXT,
  product_stock INTEGER DEFAULT 0,
  product_image_url TEXT,
  product_is_available INTEGER DEFAULT 1,
  product_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Store product/menu items
**Key Fields**:
- `product_id`: Unique identifier
- `product_name`: Item name (e.g., "Iced Latte")
- `product_description`: Item details
- `product_price`: Price in Philippine Pesos (₱)
- `product_category`: Category (Food/Drinks)
- `product_stock`: Available quantity
- `product_image_url`: Product image
- `product_is_available`: Availability flag (1=available, 0=unavailable)

---

#### 3. Orders Table
```sql
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  order_total REAL NOT NULL,
  order_status TEXT DEFAULT 'pending',
  order_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  order_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

**Purpose**: Store customer orders
**Key Fields**:
- `order_id`: Unique order identifier
- `user_id`: Customer reference
- `order_total`: Total amount (₱)
- `order_status`: Status (pending, preparing, ready, completed, cancelled)
- `order_created_at`: Order timestamp
- `order_updated_at`: Last update timestamp

**Order Statuses**:
- `pending`: Order received, awaiting preparation
- `preparing`: Currently being prepared
- `ready`: Ready for pickup
- `completed`: Order completed
- `cancelled`: Order cancelled

---

#### 4. Order Items Table
```sql
CREATE TABLE order_items (
  order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  order_item_product_id INTEGER NOT NULL,
  order_item_product_name TEXT NOT NULL,
  order_item_quantity INTEGER NOT NULL,
  order_item_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (order_item_product_id) REFERENCES products(product_id)
);
```

**Purpose**: Store individual items within orders
**Key Fields**:
- `order_item_id`: Unique identifier
- `order_id`: Parent order reference
- `order_item_product_id`: Product reference
- `order_item_product_name`: Product name (snapshot)
- `order_item_quantity`: Quantity ordered
- `order_item_price`: Unit price at purchase time

---

#### 5. Payments Table
```sql
CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL UNIQUE,
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_amount REAL NOT NULL,
  payment_otp_request_id TEXT,
  payment_created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  payment_completed_at TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

**Purpose**: Store payment records
**Key Fields**:
- `payment_id`: Unique identifier
- `order_id`: Order reference
- `payment_method`: Payment type (bank_transfer, e_wallet, cash)
- `payment_status`: Status (pending, confirmed, failed)
- `payment_amount`: Amount paid (₱)
- `payment_otp_request_id`: SMS OTP request ID (for verification)
- `payment_created_at`: Payment initiation time
- `payment_completed_at`: Completion time

**Payment Methods**:
- `bank_transfer`: Bank transfer via SMS OTP
- `e_wallet`: E-wallet payment via SMS OTP
- `cash`: Cash on delivery/pickup

---

### Database Relationships

```
Users (1) ──────→ (Many) Orders
  ↓
  └──→ (Many) Payments (through Orders)

Orders (1) ──────→ (Many) Order Items
  ↓
  └──→ (1) Payments

Products (1) ──────→ (Many) Order Items
```

---

## Core Functionalities

### 1. Authentication & User Management

#### A. Registration
- **Username/Email/Password**: Traditional account creation
- **Phone Number**: Required for SMS verification
- **Profile Image**: Selection from avatar styles (DiceBear API)
- **Validation**:
  - Email format validation
  - Phone format (09XXXXXXXXX - Philippine format)
  - Password minimum 6 characters
  - Username minimum 3 characters

#### B. Login
- **Email/Password Login**: Standard authentication
- **Google OAuth**: Third-party authentication
- **Session Management**: JWT token-based (7-day expiry)
- **Profile Sync**: Automatic profile image from Google

#### C. Profile Management
- **Profile Image Selection**: Choose from avatar gallery
- **Phone Number Management**: Add/update phone for OTP
- **Profile Updates**: Username, password, profile image
- **Data Persistence**: LocalStorage for client-side caching

---

### 2. Product Management (Customer Side)

#### A. Product Browsing
- **Product Listing**: All available products with details
- **Search**: By product name or description
- **Filtering**: By category (Food/Drinks)
- **Product Details**: Name, description, price, image, category
- **Availability Status**: Show/hide unavailable items

#### B. Shopping Cart
- **Add to Cart**: Add products with quantity
- **Modify Quantity**: Increase/decrease item quantity
- **Remove Items**: Delete items from cart
- **Persistent Storage**: Save cart per user in localStorage
- **Cart Summary**: Total items and total price calculation

---

### 3. Order Management

#### A. Order Placement
- **Checkout Process**: 
  1. Review cart items
  2. Confirm delivery details
  3. Select payment method
  4. Place order
  
- **Order Confirmation**: 
  - Real-time receipt generation
  - Order number assignment
  - Order summary display
  - Automatic cart clearing

#### B. Order Tracking
- **Order History**: View all past orders with details
- **Order Search**: Filter by order ID or item name
- **Order Status**: Real-time status updates (pending → completed)
- **Status Badges**: Visual indicators for each status
- **Order Details**: Expandable cards showing items and totals

#### C. Order Admin Dashboard (Cafe Side)
- **Incoming Orders**: List of new orders
- **Order Status Management**: Update order status
- **Order Filtering**: By status, date range
- **Order Details**: View customer info and items
- **Order Statistics**: Total orders, revenue, trends

---

### 4. Payment Processing

#### A. Payment Methods
1. **Bank Transfer**
   - SMS OTP verification via Semaphore
   - 6-digit code confirmation
   - Success/failure callbacks
   
2. **E-Wallet**
   - SMS OTP verification via Semaphore
   - Same OTP flow as bank transfer
   - Real-time confirmation

3. **Cash Payment**
   - No OTP required
   - Mark as completed on pickup

#### B. OTP Verification
- **SMS Integration**: Semaphore API
- **OTP Generation**: 6-digit code
- **Timeout**: 5 minutes validity
- **Retry Logic**: Up to 3 attempts
- **Error Handling**: Detailed error messages

#### C. Payment Confirmation
- **Receipt Generation**: Detailed payment receipt
- **Payment Status**: pending → confirmed
- **Order Finalization**: Update order status
- **Cart Clearing**: Automatic after successful payment

---

### 5. Analytics & Dashboard (Admin)

#### A. Sales Statistics
- **Time Ranges**: All Time, This Month, This Week, Today
- **Metrics**:
  - Total Orders
  - Total Revenue (₱)
  - Average Order Value
  - Peak Hours/Days
  
#### B. Product Analytics
- **Top Sellers**: Most ordered products
- **Revenue by Category**: Food vs Drinks
- **Stock Status**: Current inventory levels

#### C. Customer Analytics
- **Total Customers**: Registered users
- **Repeat Customers**: Frequency metrics
- **Customer Preferences**: Product insights

---

## Module Structure

### Backend Module Organization

```
backend/
├── database.js                 # SQLite connection & initialization
├── server.js                   # Express app setup & routes
├── migrations/
│   └── 20251201_refactor_database_with_prefixes.js  # Schema management
├── routes/
│   ├── auth.js                # Main auth routes
│   ├── cafe-side/
│   │   ├── auth.js
│   │   ├── products.js         # Cafe product management
│   │   ├── orders.js           # Order status management
│   │   ├── customers.js        # Customer directory
│   │   ├── payments.js         # Payment tracking
│   │   └── stats.js            # Analytics dashboard
│   └── customer-side/
│       ├── auth.js             # Customer auth (register, login, Google)
│       ├── products.js         # Product browsing API
│       ├── categories.js       # Category filtering
│       ├── orders.js           # Customer order history
│       └── payments.js         # Payment processing & OTP
├── services/
│   ├── apiService.js           # External API integration
│   ├── emailService.js         # Email notifications
│   ├── smsService.js           # SMS OTP via Semaphore
│   ├── profileService.js       # User profile management
│   └── paymentService.js       # Payment logic
└── scripts/
    ├── clearData.js            # Database cleanup utility
    └── seedOrders.js           # Test data generation
```

### Frontend Module Organization

#### Customer Side
```
customer-side/
├── src/
│   ├── main.jsx                # App entry point
│   ├── App.jsx                 # Router & layout
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation header
│   │   ├── Footer.jsx          # Footer
│   │   ├── FloatingCart.jsx    # Cart indicator
│   │   ├── AnimatedBackground.jsx
│   │   └── Receipt.jsx         # Receipt display
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state management
│   │   └── CartContext.jsx     # Cart state management
│   ├── pages/
│   │   ├── Homepage.jsx        # Landing page
│   │   ├── Login.jsx           # Auth page (email/Google)
│   │   ├── ProfileSelection.jsx # Avatar picker
│   │   ├── Menu.jsx            # Product listing
│   │   ├── Cart.jsx            # Shopping cart
│   │   ├── Checkout.jsx        # Payment page
│   │   ├── ReceiptPage.jsx     # Order confirmation
│   │   ├── Orders.jsx          # Order history
│   │   ├── About.jsx           # About page
│   │   └── Contact.jsx         # Contact page
│   └── services/
│       └── profileService.js   # Profile API calls
```

#### Cafe Admin Side
```
cafe-side/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── CafeBackground.jsx
│   ├── front-end/
│   │   ├── Dashboard.jsx       # Main analytics
│   │   ├── Orders.jsx          # Order management
│   │   ├── Products.jsx        # Inventory
│   │   ├── Customers.jsx       # Customer list
│   │   ├── Payments.jsx        # Payment history
│   │   ├── Categories.jsx      # Category management
│   │   ├── Login.jsx
│   │   └── Settings.jsx
│   └── layouts/
│       └── AdminLayout.jsx
```

---

## Technical Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Routing**: React Router v6
- **UI Icons**: Lucide React
- **External APIs**: 
  - Google OAuth (Authentication)
  - DiceBear API (Avatar generation)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3 with better-sqlite3
- **Authentication**: JWT, bcryptjs
- **External APIs**:
  - Google OAuth2 Library (Authentication)
  - Semaphore (SMS OTP verification)
  - TheMealDB API (Food product data seeding)
  - TheCocktailDB API (Beverage product data seeding)
- **Email**: Email service integration
- **Environment**: dotenv for configuration

### Development Tools
- **Package Manager**: npm
- **Build Tools**: Vite
- **Linting**: ESLint
- **CSS Post-processing**: PostCSS

---

## API Endpoints

### Customer Side Endpoints

#### Authentication Routes (`/api/customer/auth`)
```
POST /register
  Body: { username, email, password, phone, profile_image? }
  Returns: { token, user }

POST /login
  Body: { email, password }
  Returns: { token, user }

POST /google
  Body: { credential }
  Returns: { token, user, isNewUser, needsPhone }

PUT /profile
  Body: { username?, password?, profile_image?, phone? }
  Returns: { token, user, message }

GET /profile
  Returns: { user }
```

#### Product Routes (`/api/customer/products`)
```
GET /
  Returns: [products]

GET /search?q=query
  Returns: [filtered_products]

GET /:id
  Returns: product
```

#### Orders Routes (`/api/customer/orders`)
```
GET /
  Returns: [orders]

POST /
  Body: { cart_items, user_id }
  Returns: { order }

GET /:id
  Returns: order_with_items

PUT /:id/status
  Body: { status }
  Returns: { order }
```

#### Payments Routes (`/api/customer/payments`)
```
POST /
  Body: { order_id, payment_method, amount }
  Returns: { payment, requestId }

POST /confirm-otp
  Body: { requestId, otp }
  Returns: { payment, order }

GET /
  Returns: [payments]
```

---

### External Data Integration APIs

#### TheMealDB API
- **Purpose**: Auto-seed food products (breakfast, desserts, pasta, vegetarian)
- **Endpoint**: `https://www.themealdb.com/api/json/v1/1/filter.php?c={category}`
- **Data Retrieved**: Meal name, description, category, image URL
- **Integration**: `apiService.js` - `seedPastryProducts()` function
- **Usage**: Automatically populates 25+ food items during product setup
- **Categories**: Breakfast, Dessert, Pasta, Vegetarian

#### TheCocktailDB API
- **Purpose**: Auto-seed non-alcoholic beverage products
- **Endpoint**: `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic`
- **Data Retrieved**: Drink name, description, category, image URL
- **Integration**: `apiService.js` - `seedDrinkProducts()` function
- **Usage**: Automatically populates 25+ beverage items during product setup
- **Restriction**: Only non-alcoholic drinks for campus setting

#### DiceBear API
- **Purpose**: Generate customizable avatar images
- **Endpoint**: `https://www.dicebear.com/api/`
- **Avatar Styles Available**:
  1. Avataaars - Cartoon-style avatars
  2. Bottts - Robot/bot avatars
  3. Pixel-art - 8-bit style avatars
  4. Lorelei - Fantasy character avatars
  5. Notionists - Minimalist avatars
  6. Open-peeps - Open source character avatars
  7. Thumbs - Thumbs up/down style
  8. Fun-emoji - Emoji-based avatars
- **Integration**: ProfileSelection page for user avatar customization
- **Usage**: Users choose style and variation during registration

#### Dashboard/Stats Routes (`/api/cafe/stats`)
```
GET /summary
  Returns: { totalOrders, totalRevenue, metrics }

GET /orders?range=week|month|all
  Returns: { orders, stats }

GET /products
  Returns: [products_with_sales_data]
```

#### Orders Management (`/api/cafe/orders`)
```
GET /
  Returns: [orders]

PUT /:id/status
  Body: { status }
  Returns: { order }
```

#### Payments Tracking (`/api/cafe/payments`)
```
GET /
  Returns: [payments]

GET /:id
  Returns: payment_details
```

---

## Security & Authentication

### JWT Authentication
- **Algorithm**: HS256
- **Expiry**: 7 days
- **Payload**: `{ id, email, username, phone }`
- **Storage**: localStorage (client-side)
- **Transmission**: Authorization header (`Bearer <token>`)

### Password Security
- **Hashing**: bcryptjs (10 rounds)
- **Validation**: Minimum 6 characters
- **Storage**: Never in plaintext

### OAuth Integration
- **Provider**: Google OAuth 2.0
- **Flow**: Authorization Code flow
- **Verification**: server-side token verification
- **Profile Sync**: Automatic profile image from Google

### Phone Number Verification
- **Format**: 09XXXXXXXXX (Philippine format)
- **Validation**: Regex pattern matching
- **Normalization**: Remove spaces/dashes

### OTP Security
- **Provider**: Semaphore SMS API
- **Code**: 6-digit random number
- **Validity**: 5 minutes
- **Attempts**: Max 3 retries
- **Request Tracking**: Via request ID

### Data Protection
- **Sensitive Fields**: Passwords, OTPs, tokens
- **CORS**: Enabled for frontend origins
- **SQL Injection**: Parameterized queries throughout
- **Input Validation**: All user inputs validated

---

## Deployment & Setup

### Prerequisites
- Node.js v16+
- npm v8+
- SQLite3
- Google OAuth credentials
- Semaphore API account (SMS)

### Environment Variables
```bash
# Backend (.env)
PORT=3000
JWT_SECRET=your_jwt_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
SEMAPHORE_API_KEY=your_semaphore_api_key

# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### Installation & Running

#### Backend Setup
```bash
cd backend
npm install
node server.js
# Server runs on http://localhost:3000
```

#### Customer Frontend Setup
```bash
cd customer-side
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

#### Cafe Admin Frontend Setup
```bash
cd cafe-side
npm install
npm run dev
# Admin runs on http://localhost:5174
```

### Database Initialization
- Database auto-creates on first server start
- Migration runs automatically (`20251201_refactor_database_with_prefixes.js`)
- Tables: users, products, orders, order_items, payments

### Utility Scripts
```bash
# Clear all data (backup first!)
cd backend/scripts
node clearData.js

# Seed test orders
node seedOrders.js
```

---

## Data Flow Examples

### 1. Customer Registration & Login Flow

```
Customer
   ↓
[Register/Login Page]
   ↓
[Submit credentials or Google token]
   ↓
[Backend validates]
   ↓
[Generate JWT token]
   ↓
[Store in localStorage]
   ↓
[Redirect to Profile Selection or Menu]
   ↓
[User authenticated for subsequent requests]
```

### 2. Order Placement & Payment Flow

```
Customer Views Menu
   ↓
[Add items to cart]
   ↓
[Proceed to checkout]
   ↓
[Confirm order details]
   ↓
[Select payment method]
   ↓
[Bank Transfer/E-Wallet → SMS OTP sent]
   ↓
[Customer enters OTP]
   ↓
[Backend verifies OTP with Semaphore]
   ↓
[Payment confirmed]
   ↓
[Order status: pending → preparing]
   ↓
[Receipt generated and displayed]
   ↓
[Cart cleared]
   ↓
[Order added to history]
```

### 3. Admin Order Management Flow

```
Order Received
   ↓
[Admin dashboard shows new order]
   ↓
[Admin clicks to view order details]
   ↓
[Update status: pending → preparing]
   ↓
[Notification sent to customer (optional)]
   ↓
[Status: ready]
   ↓
[Customer notified for pickup]
   ↓
[Admin marks: completed]
   ↓
[Order appears in history]
   ↓
[Analytics updated]
```

---

## Performance Considerations

### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Lazy Loading**: Images lazy-loaded
- **Caching**: LocalStorage for user data & cart
- **State Management**: Context API optimized with memoization
- **Build**: Vite for fast development & optimized production builds

### Backend Optimization
- **Database Indexes**: On user_id, order_id, product_id
- **Query Optimization**: Parameterized queries
- **Connection Pooling**: Better-sqlite3 handles efficiently
- **Error Handling**: Comprehensive error responses
- **Logging**: Console logs for debugging

### Database Optimization
- **Prefixed Columns**: Consistent naming convention
- **Foreign Keys**: Maintain referential integrity
- **Timestamps**: Track creation and update times
- **Indexes**: On frequently queried columns

---

## Future Enhancements

### Phase 2 Features
- Email notifications for order status
- Real-time notifications (WebSocket)
- Loyalty/rewards program
- Product reviews & ratings
- Dietary preferences/allergies
- Queue management system
- Multiple location support

### Phase 3 Features
- Mobile app (React Native)
- Payment integration (Stripe, PayMongo)
- Inventory forecasting
- Supplier management
- Delivery tracking
- Customer analytics & insights
- Multi-language support

---

## Conclusion

UniCafe is a comprehensive, scalable solution for campus coffee shop management. The three-tier architecture provides clear separation of concerns, while the modular component structure allows for easy maintenance and future enhancements. With robust authentication, secure payment processing, and comprehensive analytics, UniCafe provides a complete ecosystem for both customers and administrators.

The system is production-ready with proper error handling, security measures, and can be deployed to production environments with minimal configuration changes.

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Author**: AI Assistant  
**Status**: Complete System Documentation
