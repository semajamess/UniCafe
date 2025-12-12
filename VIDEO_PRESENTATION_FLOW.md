# 🎬 UniCafe Video Presentation Flow

## 📋 Presentation Overview
**Duration:** 15-20 minutes  
**Format:** Live demonstration with dual-screen setup (Customer + Admin)  
**Objective:** Showcase full-stack café management system with emphasis on core functionalities, real-time features, and recent improvements

---

## 📊 System Evolution: Original vs Current Implementation

### Original System Documentation (Initial Design)
The UniCafe system was originally designed as a comprehensive café management platform with:
- Dual-interface architecture (Customer + Admin portals)
- Three-tier system architecture (Presentation, Application, Data layers)
- Core features: Authentication, Product Catalog, Shopping Cart, Order Management, Payment Processing
- SQLite database with normalized schema
- Real-time order tracking and notifications
- Multiple payment methods with SMS OTP verification
- Analytics dashboard for business insights

### Current Implementation (December 2025 Updates)

#### **🆕 Major Enhancements Added**

**1. Account Deactivation & Reactivation System**
- **Original:** Simple account deletion (not implemented)
- **Current:** 
  - Soft delete with "DEACTIVATE" confirmation modal
  - Reactivation flow with "REACTIVATE" confirmation
  - Success modals for better UX
  - Full data preservation (orders, payments, history)
  - Visual indicators in admin dashboard (red badges)
  - Support for both regular and Google OAuth accounts

**2. UI/UX Improvements**
- **Original:** Basic interface design
- **Current:**
  - Animated splash screen on every page load
  - Consistent UtensilsCrossed icons throughout app
  - Enhanced modals with Framer Motion animations
  - Contact form data persistence for logged-in users
  - Bold customer names in payment records
  - Improved visual hierarchy and feedback

**3. Enhanced Search & Filtering**
- **Original:** Basic search functionality
- **Current:**
  - Orders: Search by ID, username, and email (removed customer name)
  - Payments: Search by ID and customer name with bold styling
  - POS: Enhanced customer search with deactivation status
  - More precise and targeted filtering

**4. Admin Settings Enhancement**
- **Original:** Editable store settings
- **Current:** Read-only display to prevent accidental changes

**5. Security & Error Handling**
- **Original:** Basic authentication
- **Current:**
  - Enhanced authentication middleware with detailed logging
  - New `/reactivate` endpoint for account restoration
  - Better error messages and validation
  - Confirmation flows to prevent accidental actions

#### **📈 Technical Improvements**
- 31 files modified across backend and frontend
- Enhanced authentication flow with better state management
- Improved database queries for deactivation handling
- Better component architecture with default props
- More robust error handling throughout the system

#### **🎯 Impact Summary**
- **Better UX:** Confirmation modals prevent accidental account deletion
- **Data Integrity:** Soft deletes preserve all customer history
- **Visual Clarity:** Red badges instantly identify deactivated accounts
- **Seamless Flow:** Auto-login after reactivation reduces friction
- **Professional Polish:** Splash screen and animations enhance brand perception

---

## 🎯 Presentation Structure

### **Part 1: Introduction & System Overview** (2-3 minutes)

#### 1.1 Opening Slide
- **Title:** "UniCafe - Complete Café Management System"
- **Team Information:** Names, roles, course
- **Project Type:** Client-Server Architecture Final Project

#### 1.2 Technology Stack Showcase
- **Frontend:**
  - React 19.2.0 (Customer & Admin interfaces)
  - Tailwind CSS for styling
  - Framer Motion for animations
  - Lucide React for icons
  
- **Backend:**
  - Node.js + Express.js
  - SQLite database
  - JWT Authentication
  - Socket.IO for real-time features
  
- **Third-Party Integrations:**
  - Google OAuth 2.0 (Authentication)
  - Nodemailer (Email notifications)
  - Semaphore SMS API (SMS notifications)
  - DiceBear API (Avatar generation)
  - Multer (File uploads)

#### 1.3 System Architecture Diagram
- Show the three-tier architecture
- Explain client-server communication
- Highlight WebSocket integration for real-time features

---

### **Part 2: Customer-Side Demonstration** (6-8 minutes)

#### 2.1 Landing Page & Splash Screen (30 seconds)
**What to Show:**
- Open browser in incognito mode
- Show animated splash screen on first load
- Highlight smooth transitions with Framer Motion
- Show responsive navigation bar

**Talking Points:**
- "Every page refresh shows our custom splash screen animation"
- "Built with Framer Motion for smooth, professional animations"
- "Fully responsive design works on all devices"

---

#### 2.2 Authentication Flow (2 minutes)

##### A. Google OAuth Sign-Up
**What to Show:**
1. Click "Sign In" button
2. Click Google OAuth button
3. Select Google account
4. Show welcome modal for new users
5. Display automatic redirect to menu

**Talking Points:**
- "Seamless Google OAuth integration"
- "One-click authentication"
- "New users see welcome modal"
- "JWT tokens for secure session management"

##### B. Regular Email/Password Sign-Up
**What to Show:**
1. Switch to "Sign Up" mode
2. Fill registration form (username, email, phone, password)
3. Show phone number validation (09XXXXXXXXX format)
4. Show password confirmation validation
5. Display success modal
6. Show profile selection page with 6 avatar styles

**Error Handling to Demonstrate:**
- Invalid email format → Red error message
- Invalid phone number → "Please enter a valid Philippine mobile number"
- Password mismatch → "Passwords do not match"
- Duplicate email → "Email already registered"

**Talking Points:**
- "Comprehensive form validation"
- "Philippine phone number format enforcement"
- "Password strength requirements"
- "DiceBear API integration for avatar generation"

---

#### 2.3 Profile Management (2 minutes)

##### A. View & Update Profile
**What to Show:**
1. Navigate to Profile page
2. Show current profile information (name, email, phone, avatar)
3. Update username
4. Change avatar style
5. Show success notification

##### B. Account Deactivation Flow ⭐ NEW FEATURE
**What to Show:**
1. Scroll to "Deactivate Account" section
2. Click "Deactivate Account" button
3. Show confirmation modal requiring "DEACTIVATE" text input
4. Try submitting with wrong text → Button remains disabled
5. Type "DEACTIVATE" correctly → Button becomes enabled
6. Click deactivate
7. Show "Account Successfully Deactivated" success modal
8. Automatic logout and redirect to login

**Talking Points:**
- "Enhanced security with manual confirmation"
- "Users must type 'DEACTIVATE' to prevent accidental deletion"
- "Beautiful success modal with clear messaging"
- "Account is soft-deleted, not permanently removed"

##### C. Account Reactivation Flow ⭐ NEW FEATURE
**What to Show:**
1. Try to login with deactivated account (email/password)
2. Show reactivation modal: "Account was deactivated. Do you want to reactivate it?"
3. Type "REACTIVATE" in confirmation field
4. Show password is NOT required (already verified during login)
5. Click "Reactivate" button
6. Automatic login after reactivation
7. Navigate back to profile → Show all data preserved

**Alternative: Google OAuth Reactivation**
1. Login with Google account that was deactivated
2. Show same reactivation modal
3. No password required for Google accounts
4. Seamless reactivation

**Talking Points:**
- "Deactivated accounts can be easily reactivated"
- "Data preservation - all orders and history intact"
- "Works with both regular and Google accounts"
- "Auto-login after reactivation for smooth UX"

---

#### 2.4 Menu & Shopping (2 minutes)

##### A. Browse Menu
**What to Show:**
1. Navigate to Menu page
2. Show category filtering (Coffee, Snacks, Desserts, Beverages, Meals)
3. Use search bar to find products
4. Show product cards with images, prices, descriptions
5. Show "Out of Stock" products (greyed out, disabled)

##### B. Shopping Cart
**What to Show:**
1. Add items to cart (show floating cart widget update)
2. Add same item again (quantity increases)
3. Click floating cart to view full cart
4. Update quantities in cart
5. Remove items
6. Show real-time total calculation
7. Close browser → Reopen → Show cart persistence (localStorage)

**Talking Points:**
- "Real-time cart updates with floating widget"
- "Cart persists across browser sessions"
- "Instant price calculations"
- "Stock availability checking"

---

#### 2.5 Checkout & Payment (2 minutes)

##### A. Bank Transfer with Email OTP
**What to Show:**
1. Navigate to Checkout
2. Show auto-filled customer info (name, email)
3. Select "Bank Transfer" payment method
4. Click "Proceed to Payment"
5. Show beautiful OTP modal
6. Check email for OTP code
7. Enter 6-digit OTP (show auto-formatting)
8. Click "Verify & Complete Order"
9. Show success modal with order ID
10. Display digital receipt

**Error Handling:**
- Wrong OTP → "Invalid OTP code"
- Expired OTP → "OTP has expired, request new one"

##### B. E-Wallet with SMS OTP (Demo Mode)
**What to Show:**
1. Select "E-Wallet" payment method
2. Click "Proceed to Payment"
3. Show SMS OTP modal
4. Enter demo OTP: 123456
5. Complete order

**Talking Points:**
- "Multiple payment methods"
- "Email and SMS OTP verification"
- "Enhanced OTP modal with auto-formatting"
- "Real email integration with Nodemailer"
- "Receipt generation for every order"

---

#### 2.6 Order Tracking (1 minute)
**What to Show:**
1. Navigate to Orders page (Profile → Orders tab)
2. Show order history with status badges
3. Expand order details
4. Show real-time status updates (when admin changes status)
5. Show notification when order status changes

**Talking Points:**
- "Complete order history"
- "Real-time status updates via Socket.IO"
- "In-app notifications for order changes"
- "Order details include items, quantities, total"

---

#### 2.7 Additional Pages (30 seconds)
**Quick Tour:**
- **About:** Show team section and company info
- **Contact:** 
  - Show contact form
  - Submit a message
  - Show email delivery to admin
  - Highlight form data preservation for logged-in users

---

### **Part 3: Admin/Cafe-Side Demonstration** (6-8 minutes)

#### 3.1 Admin Login (30 seconds)
**What to Show:**
1. Open cafe-side in new window/screen
2. Login with admin credentials
3. Show dashboard landing

**Credentials:**
- Username: `admin123`
- Password: `admin123`

---

#### 3.2 Dashboard Analytics (1 minute)
**What to Show:**
1. Show key metrics cards:
   - Total Revenue (₱)
   - Total Orders
   - Total Customers (excludes deactivated)
   - Low Stock Products
2. Show 7-day revenue chart (Recharts)
3. Show recent orders list
4. Show top customers section

**Talking Points:**
- "Real-time analytics dashboard"
- "Recharts for data visualization"
- "Customer count excludes deactivated accounts"
- "Quick access to critical metrics"

---

#### 3.3 Product Management (1.5 minutes)

##### A. View Products
**What to Show:**
- Category tabs
- Product cards with images
- Stock levels
- Edit/Delete buttons

##### B. Add New Product
**What to Show:**
1. Click "Add New Product"
2. Fill form:
   - Name
   - Category
   - Price
   - Stock quantity
   - Description
3. Upload image (two methods):
   - **URL paste:** Paste image URL
   - **File upload:** Choose file from computer
4. Submit and show product added

##### C. Edit Product
**What to Show:**
1. Click edit on existing product
2. Update price or stock
3. Save changes
4. Show success notification

**Error Handling:**
- Invalid price → "Price must be a positive number"
- Missing required fields → "Please fill all required fields"
- File size too large → "File size must be under 5MB"

**Talking Points:**
- "Full CRUD operations"
- "Dual image upload options (URL or file)"
- "Multer integration for file handling"
- "Real-time inventory management"

---

#### 3.4 Order Management Workflow ⭐ CORE FEATURE (2 minutes)

**Setup: Split Screen or Picture-in-Picture**
- Left: Customer-side (Menu/Orders page)
- Right: Admin-side (Orders page)

##### A. New Order Notification
**What to Show:**
1. **Customer:** Place a new order from menu
2. **Admin:** Show real-time notification popup (with sound)
3. **Admin:** Notification center dropdown shows new order
4. **Admin:** Order appears in "Pending" tab immediately

**Talking Points:**
- "Socket.IO real-time notifications"
- "Audio alerts for new orders"
- "Instant order visibility"

##### B. Order Status Updates
**What to Show:**
1. **Admin:** Click on pending order
2. **Admin:** Change status to "Preparing"
3. **Customer:** Show notification "Your order is being prepared"
4. **Admin:** Change status to "Ready"
5. **Customer:** Show notification "Your order is ready for pickup"
6. **Admin:** Change status to "Completed"
7. **Customer:** Order status badge updates in real-time

**Talking Points:**
- "Bi-directional real-time updates"
- "Status workflow: Pending → Preparing → Ready → Completed"
- "Automatic customer notifications on status change"
- "WebSocket communication for instant updates"

##### C. Order Details
**What to Show:**
- Customer name, email, phone
- Order items with quantities
- Payment method
- Total amount
- Order timestamp

---

#### 3.5 Customer Management with Deactivation Indicators ⭐ NEW FEATURE (1.5 minutes)

##### A. View All Customers
**What to Show:**
1. Navigate to Customers page
2. Show customer list with:
   - Avatar images
   - Names, emails
   - Total spent
   - Order count
   - Registration date
3. **Highlight deactivated customers:**
   - Red "Deactivated" badge
   - Red background styling
   - Still visible in the list

**Talking Points:**
- "Visual indicators for deactivated accounts"
- "Red badges and styling for easy identification"
- "Deactivated users still tracked for revenue/history"

##### B. Customer Details
**What to Show:**
1. Click on a customer (deactivated or active)
2. Show complete profile:
   - Contact information
   - Order history
   - Total spent
   - Registration date
3. Compare active vs deactivated customer display

---

#### 3.6 Payment Tracking (1 minute)

##### A. View All Payments
**What to Show:**
1. Navigate to Payments page
2. Show payment list with:
   - Payment ID
   - **Customer name (bold text)** ⭐ NEW
   - Amount
   - Payment method
   - OTP verification status
   - Timestamp

##### B. Search Functionality ⭐ UPDATED
**What to Show:**
1. Search by payment ID
2. Search by customer name → Show results
3. Clear search

**Talking Points:**
- "Search by payment ID or customer name"
- "Bold customer names for better readability"
- "Complete payment audit trail"
- "OTP verification records"

---

#### 3.7 Point of Sale (POS) (1.5 minutes)

##### A. Walk-in Customer Order
**What to Show:**
1. Navigate to POS
2. Select customer type: "Walk-in"
3. Add products to order
4. Adjust quantities
5. Show real-time total calculation
6. Complete order

##### B. Registered Customer Order
**What to Show:**
1. Select customer type: "Registered Customer"
2. Search for customer by name/email ⭐ UPDATED SEARCH
3. Select customer
4. Show customer info auto-filled
5. Add products
6. Complete order
7. **Show deactivated user indicator if selected** ⭐ NEW

**Talking Points:**
- "Support for walk-in and registered customers"
- "Real-time product search"
- "Instant order processing"
- "Deactivation status visible in POS"

---

#### 3.8 Settings Page ⭐ UPDATED (30 seconds)
**What to Show:**
1. Navigate to Settings
2. Show store information (read-only):
   - Store Name (cannot edit)
   - Email (cannot edit)
   - Phone (cannot edit)
   - Address (cannot edit)
3. **Highlight:** No "Save Changes" button
4. Show greyed-out input fields

**Talking Points:**
- "Settings now display-only to prevent accidental changes"
- "Read-only mode for critical store information"
- "Admin can view but not modify store details"

---

#### 3.9 Real-time Notifications (30 seconds)
**What to Show:**
1. Place order from customer side
2. Show notification bell icon update on admin side
3. Click bell to open notification dropdown
4. Show notification details
5. Click "Mark as Read"
6. Click "View All Orders" → Navigate to orders page

**Talking Points:**
- "Real-time notification system"
- "Notification center with unread count"
- "Direct navigation to related pages"

---

### **Part 4: Error Handling & Security** (2-3 minutes)

#### 4.1 Authentication Errors
**Demonstrate:**
1. **Invalid Login:**
   - Wrong password → "Invalid credentials"
   - Non-existent email → "User not found"
2. **Token Expiration:**
   - Show expired token handling
   - Auto-redirect to login
3. **Duplicate Registration:**
   - Try registering with existing email → Error message

#### 4.2 Form Validation Errors
**Demonstrate:**
1. **Customer Form Validation:**
   - Invalid email format
   - Invalid phone number format
   - Password too short
   - Password mismatch
2. **Admin Form Validation:**
   - Invalid product price
   - Negative stock quantity
   - Missing required fields

#### 4.3 Payment Errors
**Demonstrate:**
1. **OTP Verification:**
   - Invalid OTP code
   - Expired OTP
   - Network error handling
2. **Empty Cart:**
   - Try checkout with empty cart → "Cart is empty"

#### 4.4 Security Features
**Explain:**
- JWT token authentication
- bcrypt password hashing
- Input sanitization
- SQL injection prevention
- CORS configuration
- Secure cookie handling
- Account deactivation confirmation (prevents accidental deletion)

---

### **Part 5: Recent Updates Highlight** ⭐ (2 minutes)

#### 5.1 Account Deactivation/Reactivation System
**Show side-by-side comparison:**

**Before (explain):**
- No confirmation required
- Instant account deletion
- No reactivation flow

**After (demonstrate):**
1. **Deactivation:**
   - Confirmation modal with text input
   - Success modal
   - Clear messaging
2. **Reactivation:**
   - Modal on login
   - Confirmation required
   - Auto-login after reactivation
3. **Admin View:**
   - Visual indicators (red badges)
   - Data preservation
   - Revenue tracking intact

#### 5.2 UI/UX Improvements
**Show:**
1. **Splash Screen:**
   - Animated loading
   - Works on every refresh
   - Professional branding
2. **Icon Consistency:**
   - UtensilsCrossed throughout app
   - Cohesive design language
3. **Search Enhancements:**
   - Orders: ID, username, email
   - Payments: Bold customer names
   - Better filtering accuracy

#### 5.3 Technical Improvements
**Explain:**
- Enhanced authentication middleware
- Improved error logging
- Better state management
- Form data persistence
- Optimized search queries

---

### **Part 6: Technology Integration Showcase** (2 minutes)

#### 6.1 Third-Party Integrations

##### A. Google OAuth
**Demonstrate:**
- One-click login
- Token handling
- User data retrieval
- Session management

##### B. Email Service (Nodemailer)
**Show:**
- Contact form email delivery
- OTP email sending
- Order confirmation emails
- Check actual inbox

##### C. SMS Service (Semaphore - Demo)
**Explain:**
- SMS OTP integration
- Demo mode for presentation
- Production-ready API

##### D. DiceBear Avatars
**Show:**
- 6 different avatar styles
- Dynamic URL generation
- Profile picture display

##### E. File Upload (Multer)
**Demonstrate:**
- Product image upload
- File size validation
- File type checking
- Server-side storage

---

### **Part 7: Database & Backend** (1-2 minutes)

#### 7.1 Database Schema
**Show ERD or explain:**
- Users table (with user_deleted_at column)
- Products table
- Orders table
- Order_items table
- Payments table
- Notifications table
- Contact_messages table

#### 7.2 Backend Architecture
**Explain:**
- RESTful API design
- Express.js routing
- Middleware stack:
  - CORS
  - JSON body parser
  - Multer for uploads
  - JWT authentication
- Socket.IO integration
- Error handling middleware

#### 7.3 Key API Endpoints
**Highlight:**
```
Customer Routes:
- POST /api/customer/auth/register
- POST /api/customer/auth/login
- POST /api/customer/auth/google
- POST /api/customer/auth/reactivate ⭐ NEW
- DELETE /api/customer/settings/account
- GET /api/customer/products
- POST /api/customer/orders
- POST /api/customer/payments/initiate-otp

Admin Routes:
- GET /api/cafe/stats/dashboard
- GET /api/cafe/orders
- PUT /api/cafe/orders/:id/status
- GET /api/cafe/customers
- POST /api/cafe/products
- PUT /api/cafe/products/:id
```

---

### **Part 8: Conclusion & Q&A** (1-2 minutes)

#### 8.1 Project Summary
**Recap:**
- Full-stack café management system
- Real-time features with Socket.IO
- Comprehensive error handling
- Modern UI/UX with Framer Motion
- Multiple third-party integrations
- Secure authentication & authorization

#### 8.2 Key Achievements
**Highlight:**
- ✅ Dual-interface system (Customer + Admin)
- ✅ Real-time order tracking
- ✅ Multiple payment methods with OTP
- ✅ Account deactivation/reactivation system
- ✅ Google OAuth integration
- ✅ Email and SMS notifications
- ✅ Advanced search and filtering
- ✅ Responsive design
- ✅ Data preservation and soft deletes

#### 8.3 Learning Outcomes
**Discuss:**
- Client-server architecture
- RESTful API design
- WebSocket communication
- State management
- Authentication & authorization
- Third-party API integration
- Database design
- Error handling
- UI/UX best practices

#### 8.4 Future Enhancements
**Mention:**
- Mobile app (React Native)
- Advanced analytics
- Loyalty program
- Multi-branch support
- QR code ordering
- Dark mode
- Inventory management

---

## 📝 Presentation Tips

### Setup Checklist
- [ ] Two browser windows (Customer + Admin)
- [ ] Backend server running
- [ ] Test database with sample data
- [ ] Email account accessible for OTP demo
- [ ] Screen recording/streaming software ready
- [ ] Good internet connection
- [ ] Backup plan (local recording)

### During Presentation
1. **Speak clearly and at moderate pace**
2. **Explain what you're clicking before clicking**
3. **Highlight technical aspects while demoing**
4. **Show error scenarios, not just happy paths**
5. **Use split-screen for real-time features**
6. **Reference the code when relevant**
7. **Emphasize recent updates and improvements**

### Common Demo Scenarios

#### Scenario 1: Complete Customer Journey
1. Sign up with Google OAuth
2. Browse menu
3. Add items to cart
4. Checkout with bank transfer
5. Verify OTP
6. Track order status
7. Deactivate account
8. Reactivate account

#### Scenario 2: Complete Admin Workflow
1. Login to dashboard
2. View analytics
3. Add new product
4. Receive new order notification
5. Update order status
6. View customer details
7. Process POS order
8. Check payment records

#### Scenario 3: Real-time Order Flow
1. **Customer:** Place order
2. **Admin:** Receive notification
3. **Admin:** Change status to "Preparing"
4. **Customer:** Receive notification
5. **Admin:** Change status to "Ready"
6. **Customer:** Receive notification
7. **Admin:** Complete order

---

## 🎬 Video Recording Recommendations

### Equipment
- **Screen Recording:** OBS Studio or Camtasia
- **Microphone:** Good quality for clear audio
- **Camera (optional):** For presenter face cam
- **Lighting:** Ensure screen is clearly visible

### Recording Tips
1. **Record in 1080p minimum**
2. **Use presenter notes**
3. **Have a script but sound natural**
4. **Do test runs before final recording**
5. **Edit out any mistakes**
6. **Add background music (subtle)**
7. **Include captions/subtitles**

### Video Structure
1. **Intro (30 sec):** Title card with team names
2. **Content (15-18 min):** Follow presentation flow
3. **Outro (30 sec):** Thank you slide with contact info

### Editing
- Add text overlays for important points
- Highlight cursor movements
- Zoom in on specific UI elements
- Add transition effects between sections
- Include background music at low volume
- Add timestamps in description

---

## 📊 Success Metrics to Highlight

1. **31 files modified** in recent update
2. **6 major features** implemented
3. **Multiple integrations** (Google, Email, SMS, Avatars)
4. **Real-time features** working seamlessly
5. **Comprehensive error handling**
6. **Professional UI/UX** with animations
7. **Full data preservation** in soft deletes
8. **Security best practices** implemented

---

## 🎯 Final Checklist Before Recording

### Technical
- [ ] All features working
- [ ] Database populated with sample data
- [ ] Backend server running smoothly
- [ ] No console errors
- [ ] All third-party services configured
- [ ] Test all demo accounts

### Content
- [ ] Script reviewed
- [ ] Demo scenarios practiced
- [ ] Error cases prepared
- [ ] Talking points memorized
- [ ] Time limit respected (15-20 min)

### Quality
- [ ] Screen resolution optimal
- [ ] Audio levels tested
- [ ] Lighting adequate
- [ ] No background distractions
- [ ] Browser tabs cleaned up
- [ ] Unnecessary apps closed

---

**Good luck with your presentation! 🚀**
