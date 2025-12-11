# ☕ UniCafe - Complete Café Management System

A comprehensive full-stack café management system with separate customer and admin interfaces, built with modern web technologies.

## 📋 Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)

---

## 🎯 Overview

UniCafe is a modern café management system that provides:
- **Customer-facing web application** for browsing menu, placing orders, and managing profiles
- **Admin dashboard** for managing products, orders, customers, and viewing analytics
- **Real-time notifications** using Socket.IO
- **Multiple payment methods** with OTP verification
- **Google OAuth integration** for easy customer sign-up

**Live Demo Credentials:**
- **Admin:** username: `admin123` | password: `admin123`
- **Customer:** Create account via Google OAuth or email registration

---

## 🏗️ System Architecture

The system follows a client-server architecture with three main components:

```
┌─────────────────────────────────────────────────────────┐
│                    UniCafe System                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Customer    │  │    Admin     │  │   Backend    │  │
│  │  Frontend    │  │  Dashboard   │  │    Server    │  │
│  │  (Port 5173) │  │ (Port 5174)  │  │ (Port 3000)  │  │
│  │              │  │              │  │              │  │
│  │  React 19    │  │  React 19    │  │  Express.js  │  │
│  │  Tailwind    │  │  Tailwind    │  │  SQLite      │  │
│  │  Framer      │  │  Recharts    │  │  Socket.IO   │  │
│  │  Motion      │  │  Motion      │  │  JWT Auth    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                     REST API + WebSocket                │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 👥 Customer Features

#### Authentication & Profile
- **Multi-method Sign Up**: Email/Password or Google OAuth
- **Profile Management**: Update username, phone number, password, and avatar style
- **Avatar System**: 6 different avatar styles (Cartoon, Robots, Pixel Art, Lorelei, Notionists, Open Peeps)
- **Phone Number Verification**: One-time phone number addition with validation
- **Session Persistence**: Auto-login on browser return
- **Account Deactivation & Reactivation**: 
  - Deactivate account with "DEACTIVATE" confirmation modal
  - Success modal after deactivation
  - Reactivation modal on login requiring "REACTIVATE" confirmation
  - Full support for both regular and Google OAuth accounts
  - Automatic login after successful reactivation
  - Complete data preservation (orders, profile, history)

#### Menu & Ordering
- **Category Filtering**: Browse products by category (Coffee, Snacks, Desserts, Beverages, Meals)
- **Real-time Search**: Instant product search with debouncing
- **Product Details**: View product images, descriptions, prices, and availability
- **Shopping Cart**: Add, remove, update quantities with localStorage sync
- **Floating Cart Widget**: Always-visible cart summary
- **Cart Persistence**: Cart saved across sessions

#### Checkout & Payment
- **Multiple Payment Methods**:
  - Bank Transfer (with email OTP verification)
  - E-Wallet (with SMS OTP verification - demo mode)
- **Enhanced OTP Modal**: Beautiful UI with 6-digit code input, auto-formatting
- **Order Summary**: Real-time total calculation
- **Receipt Generation**: Digital receipt with order details

#### Order Tracking
- **Order History**: View all past orders with status badges
- **Order Details**: Expandable cards showing items, quantities, prices
- **Real-time Status Updates**: Preparing → Ready → Completed
- **Status Notifications**: In-app notifications for order updates

#### Additional Pages
- **Homepage**: Animated landing page with hero section and features
- **About Us**: Company information with team section
- **Contact**: Contact form with live location display and email notifications
- **Orders Page**: Complete order history with filtering
- **Profile Page**: Comprehensive profile management

### 🔐 Admin Features

#### Dashboard & Analytics
- **Key Metrics**: Total revenue, orders, customers, low stock alerts
- **Revenue Chart**: 7-day revenue trend with Recharts
- **Recent Orders**: Real-time order feed
- **Quick Stats**: Today's performance overview
- **Responsive Layout**: Works on all screen sizes

#### Product Management
- **CRUD Operations**: Create, Read, Update, Delete products
- **Image Upload**: Dual-option (URL paste or file upload via Multer)
- **Product Categories**: Organize products efficiently
- **Stock Management**: Track inventory levels
- **Price Management**: Easy pricing updates
- **Product Archiving**: Soft delete with reactivation option

#### Order Management
- **Order Dashboard**: View all orders with status filters
- **Order Details**: See complete order information
- **Status Updates**: Change order status (Pending → Preparing → Ready → Completed)
- **Customer Notifications**: Auto-send email/SMS on status change
- **Order Timeline**: Track order progression

#### Customer Management
- **Customer Database**: View all registered customers (including deactivated)
- **Customer Details**: Profile information, order history, total spent
- **Avatar Display**: Visual customer identification
- **Registration Date**: Track customer acquisition
- **Deactivation Indicators**: Visual badges and red styling for deactivated accounts
  - Red "Deactivated" badge on customer list
  - Red background styling on orders from deactivated users
  - POS search displays deactivated status
  - Revenue and order history fully preserved from deactivated users

#### Payment Tracking
- **Payment History**: All transactions with details
- **Payment Methods**: Bank Transfer, E-Wallet tracking
- **OTP Records**: Verification audit trail
- **Revenue Reports**: Financial overview

#### Settings
- **Store Information Display**: View café name, address, phone, email (read-only)
- **Profile Management**: Admin account updates
- **System Configuration**: View store settings

#### Real-time Features
- **Live Notifications**: Socket.IO powered instant updates
- **Sound Alerts**: Audio notification for new orders
- **Notification Center**: Dropdown showing recent notifications
- **Mark as Read**: Notification management

---

## 🛠️ Technology Stack

### Frontend (Customer & Admin)
- **React 19.2.0** - Latest React with concurrent features
- **React Router 7.9.6** - Client-side routing
- **Tailwind CSS 3.4.18** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Advanced animations
- **Lucide React 0.468.0** - Beautiful icon library
- **Socket.IO Client 4.8.1** - Real-time communication
- **Recharts 2.15.0** - Data visualization (Admin only)
- **Vite 7.2.4** - Lightning-fast dev server and build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js 4.18.2** - Web framework
- **SQLite3 5.1.7** - Embedded database
- **Socket.IO 4.8.1** - WebSocket server
- **JWT (jsonwebtoken 9.0.2)** - Authentication tokens
- **bcryptjs 2.4.3** - Password hashing
- **Multer 2.0.2** - File upload handling
- **Nodemailer 6.9.4** - Email service
- **Google Auth Library 10.5.0** - OAuth integration
- **CORS 2.8.5** - Cross-origin resource sharing
- **dotenv 16.6.1** - Environment variables

### Additional Services
- **DiceBear API** - Avatar generation
- **Semaphore SMS API** - SMS notifications
- **Gmail SMTP** - Email delivery
- **Google OAuth 2.0** - Social authentication

---

## 📦 Installation & Setup

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git** (for cloning)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd UniCafe/Unicafe
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# - SMTP settings for email (Gmail)
# - Google OAuth Client ID
# - Semaphore SMS API key
# - JWT secret

# Start backend server
node server.js
# or for development with auto-reload:
npm run dev
```

**Backend runs on:** `http://localhost:3000`

### 3. Customer Frontend Setup
```bash
cd ../customer-side

# Install dependencies
npm install

# Start development server
npm run dev
```

**Customer app runs on:** `http://localhost:5173`

### 4. Admin Dashboard Setup
```bash
cd ../cafe-side

# Install dependencies
npm install

# Start development server
npm run dev
```

**Admin dashboard runs on:** `http://localhost:5174`

### 5. Environment Variables

#### Backend `.env`
```env
# Server
PORT=3000

# Database
DB_FILE=./unicafe.db

# JWT
JWT_SECRET=unicafe-secret-key-2025

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=lukegabriel.arrieta@wvsu.edu.ph
SMTP_PASS=your-app-password
FROM_EMAIL=lukegabriel.arrieta@wvsu.edu.ph
SUPPORT_EMAIL=lukegabriel.arrieta@wvsu.edu.ph

# Google OAuth
GOOGLE_CLIENT_ID=381824224850-2h1em90fcn2gn9u3gjqdpg6ckk9tapsd.apps.googleusercontent.com

# SMS (Semaphore)
SEMAPHORE_API_KEY=d9057211f287e2075b79a63d143c5088
```

### 6. Database Initialization

The database automatically initializes on first run with:
- User tables
- Product tables with sample data
- Order tables
- Payment tables
- Settings with default store information
- Admin account (username: `admin123`, password: `admin123`)

---

## 📱 Usage Guide

### For Customers

1. **Sign Up/Login**
   - Click "Get Started" or "Sign In"
   - Choose Google OAuth or Email registration
   - Complete profile if needed

2. **Browse Menu**
   - Navigate to Menu page
   - Filter by category or search
   - View product details

3. **Place Order**
   - Add items to cart using floating cart
   - Review cart and proceed to checkout
   - Select payment method
   - Receive digital receipt

4. **Track Orders**
   - View order history in Orders page
   - Check order status in real-time
   - Receive notifications on updates

5. **Manage Profile**
   - Update username, phone, password
   - Change avatar style
   - View order statistics

### For Admins

1. **Login**
   - Visit `http://localhost:5174`
   - Use credentials: `admin123` / `admin123`

2. **Dashboard**
   - View key metrics and charts
   - Monitor recent orders
   - Check low stock alerts

3. **Manage Products**
   - Add new products with images (URL or upload)
   - Edit existing products
   - Archive/reactivate products
   - Manage categories and stock

4. **Process Orders**
   - View incoming orders
   - Update order status
   - Notify customers automatically

5. **View Customers**
   - Browse customer database
   - View customer details and history

6. **Track Payments**
   - Monitor all transactions
   - View OTP verification records

7. **Update Settings**
   - Edit store information
   - Update contact details

---

## 🔌 API Endpoints

### Customer Endpoints

#### Authentication
- `POST /api/customer/auth/register` - Email registration
- `POST /api/customer/auth/login` - Email login
- `POST /api/customer/auth/google` - Google OAuth
- `PUT /api/customer/auth/profile` - Update profile

#### Products
- `GET /api/customer/products` - Get all active products
- `GET /api/customer/products/:id` - Get product details

#### Categories
- `GET /api/customer/categories` - Get all categories

#### Orders
- `POST /api/customer/orders` - Create new order
- `GET /api/customer/orders` - Get user orders
- `GET /api/customer/orders/:id` - Get order details

#### Payments
- `POST /api/customer/payments/initiate-otp` - Request OTP
- `POST /api/customer/payments/confirm-otp` - Verify OTP & create order

#### Contact
- `POST /api/customer/contact` - Send contact message

#### Settings
- `GET /api/customer/settings` - Get store settings

### Admin Endpoints

#### Authentication
- `POST /api/cafe/auth/login` - Admin login
- `GET /api/cafe/auth/verify` - Verify JWT token

#### Products
- `GET /api/cafe/products` - Get all products (including archived)
- `POST /api/cafe/products` - Create product
- `PUT /api/cafe/products/:id` - Update product
- `DELETE /api/cafe/products/:id` - Archive product
- `POST /api/cafe/products/:id/reactivate` - Reactivate product

#### Upload
- `POST /api/cafe/upload-image` - Upload product image

#### Orders
- `GET /api/cafe/orders` - Get all orders
- `GET /api/cafe/orders/:id` - Get order details
- `PUT /api/cafe/orders/:id/status` - Update order status

#### Customers
- `GET /api/cafe/customers` - Get all customers
- `GET /api/cafe/customers/:id` - Get customer details

#### Payments
- `GET /api/cafe/payments` - Get all payments

#### POS (Point of Sale)
- `POST /api/cafe/pos/create-order` - Create walk-in order

#### Statistics
- `GET /api/cafe/stats/dashboard` - Get dashboard metrics
- `GET /api/cafe/stats/revenue` - Get revenue data

#### Settings
- `GET /api/cafe/settings` - Get store settings
- `PUT /api/cafe/settings` - Update store settings

#### Notifications
- `GET /api/cafe/notifications` - Get admin notifications
- `PUT /api/cafe/notifications/:id/read` - Mark notification as read

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_username TEXT UNIQUE,
  user_email TEXT UNIQUE NOT NULL,
  user_password TEXT,
  user_phone TEXT,
  user_profile_image TEXT,
  user_role TEXT DEFAULT 'customer',
  user_google_id TEXT,
  user_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Products Table
```sql
CREATE TABLE products (
  product_id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_name TEXT NOT NULL,
  product_description TEXT,
  product_price REAL NOT NULL,
  product_category TEXT NOT NULL,
  product_image_url TEXT,
  product_stock INTEGER DEFAULT 0,
  product_is_active INTEGER DEFAULT 1,
  product_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  order_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  order_total REAL NOT NULL,
  order_status TEXT DEFAULT 'pending',
  order_payment_method TEXT,
  order_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
```

### Order Items Table
```sql
CREATE TABLE order_items (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  product_id INTEGER,
  item_quantity INTEGER NOT NULL,
  item_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (product_id) REFERENCES products(product_id)
);
```

### Payments Table
```sql
CREATE TABLE payments (
  payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_otp_request_id TEXT,
  payment_amount REAL,
  payment_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
```

### Store Settings Table
```sql
CREATE TABLE store_settings (
  setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
  cafe_name TEXT DEFAULT 'UniCafe',
  cafe_address TEXT,
  cafe_phone TEXT,
  cafe_email TEXT,
  setting_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipient_type TEXT NOT NULL,
  recipient_id INTEGER,
  notification_title TEXT NOT NULL,
  notification_message TEXT NOT NULL,
  notification_type TEXT,
  notification_is_read INTEGER DEFAULT 0,
  notification_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📁 Project Structure

```
UniCafe/
├── backend/                    # Express.js backend server
│   ├── database.js            # SQLite database configuration
│   ├── server.js              # Main server file
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   ├── unicafe.db             # SQLite database file
│   ├── uploads/               # Uploaded product images
│   ├── routes/                # API route handlers
│   │   ├── cafe-side/        # Admin endpoints
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   ├── orders.js
│   │   │   ├── customers.js
│   │   │   ├── payments.js
│   │   │   ├── pos.js
│   │   │   ├── stats.js
│   │   │   ├── settings.js
│   │   │   ├── notifications.js
│   │   │   └── upload.js
│   │   └── customer-side/    # Customer endpoints
│   │       ├── auth.js
│   │       ├── products.js
│   │       ├── categories.js
│   │       ├── orders.js
│   │       ├── payments.js
│   │       ├── contact.js
│   │       └── settings.js
│   ├── services/             # Business logic services
│   │   ├── apiService.js     # External API calls
│   │   ├── emailService.js   # Email notifications
│   │   ├── smsService.js     # SMS notifications
│   │   └── profileService.js # Profile management
│   └── scripts/              # Utility scripts
│       ├── setupAdmin.js
│       ├── clearData.js
│       └── seedOrders.js
│
├── customer-side/             # Customer React app
│   ├── src/
│   │   ├── main.jsx          # App entry point
│   │   ├── App.jsx           # Main app component
│   │   ├── index.css         # Global styles
│   │   ├── pages/            # Page components
│   │   │   ├── Homepage.jsx
│   │   │   ├── Auth.jsx      # Login/Signup
│   │   │   ├── Menu.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── About.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── ReceiptPage.jsx
│   │   │   └── ProfileSelection.jsx
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── FloatingCart.jsx
│   │   │   ├── Receipt.jsx
│   │   │   ├── SuccessModal.jsx
│   │   │   └── AnimatedBackground.jsx
│   │   └── context/          # React Context
│   │       ├── AuthContext.jsx
│   │       ├── CartContext.jsx
│   │       └── NotificationContext.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── cafe-side/                 # Admin React app
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── pages/            # Admin pages
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Customers.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── POS.jsx
│   │   │   └── Settings.jsx
│   │   ├── components/       # Admin components
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── CafeBackground.jsx
│   │   ├── layouts/
│   │   │   └── AdminLayout.jsx
│   │   └── context/
│   │       └── NotificationContext.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
└── README.md                  # This file
```

---

## 🎨 Key Features Breakdown

### Authentication System
- **JWT-based authentication** with secure token storage
- **Google OAuth 2.0** integration for quick signup
- **Password hashing** with bcryptjs (10 salt rounds)
- **Role-based access control** (customer vs admin)
- **Protected routes** on both frontend and backend

### Real-time Communication
- **Socket.IO WebSocket** connections for instant updates
- **Admin notification system** for new orders
- **Customer notification system** for order status changes
- **Sound alerts** for important events
- **Unread notification badges**

### Payment System
- **OTP verification** for secure payments
- **Email OTP** for bank transfers (sent via Nodemailer)
- **SMS OTP** for e-wallets (via Semaphore API - demo mode uses 123456)
- **Payment tracking** with complete audit trail
- **Receipt generation** with order details

### File Upload System
- **Multer middleware** for handling multipart/form-data
- **File type validation** (images only: jpg, jpeg, png, gif, webp)
- **File size limit** (5MB max)
- **Unique filename generation** to prevent conflicts
- **Static file serving** from /uploads directory
- **Dual input mode** (URL paste or file upload)

### Data Management
- **SQLite database** with async/await operations
- **Foreign key constraints** for data integrity
- **Soft delete** for products (archived instead of deleted)
- **Timestamp tracking** for all records
- **Transaction support** for complex operations

### UI/UX Features
- **Responsive design** works on mobile, tablet, desktop
- **Framer Motion animations** for smooth transitions
- **Loading states** for all async operations
- **Error handling** with user-friendly messages
- **Form validation** on both client and server
- **Toast notifications** for user feedback
- **Skeleton loaders** for better perceived performance

---

## 🔒 Security Features

- **Password hashing** with bcryptjs
- **JWT token authentication** with expiration
- **Environment variables** for sensitive data
- **CORS configuration** to prevent unauthorized access
- **Input validation** on all endpoints
- **SQL injection prevention** via parameterized queries
- **File upload restrictions** (type and size)
- **OTP expiration** for payment verification
- **Role-based authorization** for admin routes
- **Soft delete implementation** for user accounts
  - Deleted users excluded from duplicate checks (allows username/email reuse)
  - Auto-reactivation on successful authentication
  - Admin accounts cannot be reactivated (security measure)
  - Revenue and order data fully preserved

---

## 📊 Performance Optimizations

- **Vite build tool** for fast development and production builds
- **Code splitting** with React.lazy (if needed)
- **Image optimization** recommendations
- **Database indexing** on foreign keys
- **Memoization** in React components where needed
- **Debounced search** to reduce API calls
- **LocalStorage caching** for cart and user data
- **Pagination** support in API endpoints

---

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify `.env` file exists with correct values
- Run `npm install` to ensure dependencies are installed
- Check SQLite database file permissions

### Frontend won't load
- Ensure backend is running first
- Check console for errors
- Verify API_URL in frontend code matches backend port
- Clear browser cache and localStorage

### Google OAuth not working
- Verify GOOGLE_CLIENT_ID in backend `.env`
- Check authorized JavaScript origins in Google Console
- Ensure redirect URIs are correctly configured

### Email/SMS not sending
- Verify SMTP credentials in `.env`
- Check Semaphore API key is valid
- For Gmail, ensure "Less secure app access" or use App Password
- Check spam folder for test emails

### Images not uploading
- Verify `/uploads` directory exists and has write permissions
- Check file size is under 5MB
- Ensure file type is supported (jpg, png, gif, webp)
- Check multer configuration in backend

---

## 👥 Team 

**UniCafe** - Client-Server Architecture Project

**Contact Information:**
- **Address:** San Nicolas, Lapaz, Iloilo City
- **Phone:** +63 912 345 6789
- **Email:** lukegabriel.arrieta@wvsu.edu.ph

**Technologies Used:**
- React, Express.js, SQLite, Socket.IO, Tailwind CSS
- Google OAuth, Nodemailer, Semaphore SMS
- DiceBear Avatars, Framer Motion, Recharts

---

## 🚀 Future Enhancements

- [ ] Order scheduling/pre-orders
- [ ] Loyalty points system
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] QR code table ordering
- [ ] Analytics dashboard expansion
- [ ] Inventory management
- [ ] Employee management
- [ ] Receipt printer integration
- [ ] Dark mode support
- [x] **Account deactivation/soft delete** (Implemented Dec 12, 2025)
  - Users can deactivate their accounts
  - Automatic reactivation on login
  - Visual indicators in admin dashboard
  - Full data preservation

---

## 📝 Recent Updates

### December 12, 2025 - Major UX & Feature Updates

#### 🔐 Account Deactivation & Reactivation System
**Customer Features:**
- ✅ **Deactivation Confirmation Modal**: Users must type "DEACTIVATE" to confirm account deactivation
- ✅ **Success Modal**: Beautiful confirmation screen after successful deactivation
- ✅ **Reactivation Flow**: Deactivated accounts show reactivation modal on login
- ✅ **Reactivation Confirmation**: Users must type "REACTIVATE" to restore their account
- ✅ **Google Account Support**: Full support for Google OAuth deactivation/reactivation
- ✅ **Auto-Login After Reactivation**: Seamless experience with automatic authentication
- ✅ **Data Preservation**: Complete order history and profile data maintained

**Admin Features:**
- ✅ **Visual Indicators**: Red badges and styling for deactivated accounts
- ✅ **Customer Management**: View deactivation status in customer list
- ✅ **Order Tracking**: Deactivated user orders clearly marked
- ✅ **Revenue Preservation**: All financial data from deactivated users retained
- ✅ **Read-Only Settings**: Cafe settings now display-only to prevent accidental changes

#### 🎨 UI/UX Improvements
- ✅ **Splash Screen Animation**: Beautiful loading animation on every page refresh
- ✅ **Consistent Iconography**: Replaced Coffee icons with UtensilsCrossed throughout app
- ✅ **Contact Form Enhancement**: User data persists after sending messages
- ✅ **Search Optimization**: 
  - Orders search by ID, username, and email (removed customer name)
  - Payments search with bold customer names for better readability
- ✅ **Modal Improvements**: Enhanced success modals with better animations

#### 🔧 Technical Improvements
**Backend:**
- Enhanced authentication middleware with detailed logging
- New `/reactivate` endpoint for account restoration
- Updated Google OAuth flow to handle deactivated accounts
- Improved search queries across Orders, Payments, and POS
- Password verification for reactivation (regular accounts)

**Frontend:**
- Added `setToken` and `setUser` exports in AuthContext
- Enhanced Auth.jsx with reactivation modal component
- Updated Profile.jsx with deactivation confirmation input
- Modified App.jsx for persistent splash screen display
- SplashScreen component now accepts default props

**Files Modified (31 files):**
- Backend: auth.js, settings.js, orders.js, customers.js, stats.js, pos.js, profileService.js
- Customer-side: Auth.jsx, Profile.jsx, Contact.jsx, App.jsx, AuthContext.jsx, SplashScreen.jsx
- Cafe-side: Settings.jsx, Orders.jsx, Payments.jsx, Products.jsx, Login.jsx, POS.jsx, Sidebar.jsx, Header.jsx
- Components: Navbar.jsx, Footer.jsx, FloatingCart.jsx

#### 🎯 Key Features Summary
- **Account Deactivation**: Soft delete with manual confirmation ("DEACTIVATE")
- **Account Reactivation**: Modal-based restoration with confirmation ("REACTIVATE")
- **Splash Screen**: Animated loading on every refresh (not session-based)
- **Enhanced Search**: More precise filtering across admin dashboard
- **UI Polish**: Consistent icons, better modals, preserved form data
- **Google OAuth**: Full integration with deactivation/reactivation flow

---


