# 🎤 UniCafe Presentation Script
## Comprehensive Script for API Integration and System Clarity

**Duration:** 10-15 minutes  
**Focus:** Organized presentation flow + Clear API integration explanation

---

## 📌 Part 1: INTRODUCTION (2 minutes)

### Opening Statement
> "Good [morning/afternoon], everyone. Today, we're presenting **UniCafe** - a complete café management system built with a client-server architecture. I'm [Your Name], and my team members are [Team Members' Names]."

### Project Overview
> "UniCafe is a full-stack web application that connects café owners with their customers through two separate but integrated interfaces:
> 
> 1. A **customer-facing web app** for browsing products and placing orders
> 2. An **admin dashboard** for managing the café's operations
> 
> Both interfaces communicate with a centralized backend server through RESTful APIs, which I'll explain in detail shortly."

### System Architecture Quick Overview
> "The system follows a **three-tier client-server architecture**:
> 
> - **Presentation Layer**: Two React frontends (Customer Portal on port 5173 and Admin Dashboard on port 5174)
> - **Application Layer**: Express.js backend server running on port 3000
> - **Data Layer**: SQLite database storing all business data
> 
> All three components communicate through HTTP requests and WebSocket connections for real-time features."

---

## 📌 Part 2: API INTEGRATION EXPLANATION (4-5 minutes)

### What is API Integration?
> "Before diving into the demo, let me explain our API architecture - this is the backbone of our client-server communication. We integrate both **internal APIs** that we built and **external third-party APIs** to create a complete system."

---

### External API Integrations
> "Our system leverages several external APIs to enhance functionality:

#### 1. **Google OAuth 2.0 API**
- **Purpose**: Simplified customer authentication without password management
- **How it's utilized**:
  - Customer clicks 'Sign in with Google' on login page
  - Frontend uses `@react-oauth/google` library to initiate OAuth flow
  - Google returns user credentials (email, name, profile picture)
  - Backend validates token and creates/authenticates user account
  - **Benefits**: Faster registration, enhanced security, no password storage needed
- **Endpoints used**: 
  - Google OAuth consent screen
  - Token validation endpoint
  - User info endpoint

#### 2. **Nodemailer Email Service**
- **Purpose**: Automated email delivery for OTP verification and receipts
- **How it's utilized**:
  - **Payment OTP**: Sends 6-digit verification code to customer email
  - **Order Receipts**: Emails detailed receipt after successful payment
  - **Contact Form**: Forwards customer inquiries to café admin email
  - Uses SMTP configuration (Gmail/SendGrid)
- **Integration points**:
  - Triggered after order creation
  - OTP generation and email dispatch
  - Receipt formatting with order details
- **Benefits**: Professional communication, payment security, order confirmation

#### 3. **DiceBear Avatars API**
- **Purpose**: Generate unique profile avatars for customers
- **How it's utilized**:
  - Customer selects avatar style in profile settings
  - Frontend requests avatar from DiceBear CDN: `https://api.dicebear.com/7.x/{style}/svg?seed={username}`
  - 6 available styles: Cartoon, Robots, Pixel Art, Lorelei, Notionists, Open Peeps
  - Avatar URL stored in database, displayed across the system
- **Benefits**: Personalized user experience, no image upload needed, consistent styling

#### 4. **TheCocktailDB API**
- **Purpose**: External database for drink/beverage product information
- **How it's utilized**:
  - **Product Seeding**: Backend fetches non-alcoholic drinks to populate initial menu
  - **Autocomplete Feature**: Admin can search for drinks when adding products
  - **API Endpoint**: `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic`
  - **Product Details**: `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i={drinkId}`
  - Returns: Drink name, description, category, thumbnail image
  - Backend automatically seeds 25 drinks with images and pricing
- **Benefits**: Rich product catalog, professional drink images, reduces manual data entry

#### 5. **TheMealDB API**
- **Purpose**: External database for food/meal product information
- **How it's utilized**:
  - **Product Seeding**: Fetches meals from multiple categories (Breakfast, Dessert, Pasta, Vegetarian)
  - **Autocomplete Feature**: Admin searches for food items when creating products
  - **API Endpoint**: `https://www.themealdb.com/api/json/v1/1/filter.php?c={category}`
  - **Meal Details**: `https://www.themealdb.com/api/json/v1/1/lookup.php?i={mealId}`
  - Returns: Meal name, area (cuisine type), category, thumbnail image
  - Backend seeds approximately 25 food items across different categories
- **Benefits**: Diverse menu options, authentic food images, quick product creation

#### 6. **Socket.IO Real-time Engine**
- **Purpose**: WebSocket protocol for instant bidirectional communication
- **How it's utilized**:
  - Backend emits events when new orders are placed
  - Admin dashboard listens for `newOrder` events
  - Notification bell updates instantly without page refresh
  - Enables real-time order status updates
- **Technical implementation**:
  ```javascript
  // Backend emits event
  io.emit('newOrder', { orderId, customer, items, total });
  
  // Frontend listens for event
  socket.on('newOrder', (data) => {
    // Update notifications, show alert
  });
  ```
- **Benefits**: Instant admin alerts, improved responsiveness, better customer service

---

### Internal RESTful API Endpoints
> "We built **45+ custom API endpoints** organized into two main groups:

#### **Customer-Side APIs** (`/api/customer`)
- **Authentication**: Register, login, logout, verify, reactivate accounts
- **Products**: Browse catalog, filter by category, search, view details
- **Orders**: Create orders, view history, track status, cancel orders
- **Payments**: Initiate payment, OTP verification, generate receipts
- **Profile**: Update settings, change password, manage avatar, deactivate account
- **Contact**: Send inquiries to café administration

#### **Admin-Side APIs** (`/api/cafe`)
- **Dashboard Analytics**: Revenue stats, sales trends, top products, customer insights
- **Product Management**: Create, update, delete products, manage inventory
- **Order Management**: View all orders, update status, search, delete
- **Customer Management**: View customer list, order history, spending analytics
- **POS System**: Process walk-in orders, search customers, today's summary
- **Payments**: Track all transactions, view payment details
- **Notifications**: Retrieve, mark as read, delete notifications
- **Settings**: View and update café information

> "These endpoints follow REST principles with proper HTTP methods (GET for retrieval, POST for creation, PUT/PATCH for updates, DELETE for removal) and return standardized JSON responses."

---

### API Integration Benefits
> "Combining external and internal APIs provides several key advantages:

**External API Benefits:**
1. **Faster Development**: Leverage existing services instead of building from scratch
2. **Enhanced Security**: Google OAuth uses industry-standard authentication
3. **Reliability**: Third-party services have high uptime and redundancy
4. **Cost-Effective**: Free tiers for email, avatars, OAuth, and product databases
5. **Professional Features**: Email delivery, real-time updates, social login, rich product data
6. **Rich Content**: TheCocktailDB and TheMealDB provide high-quality images and detailed product info

**Internal API Benefits:**
1. **Separation of Concerns**: Frontend focuses on UI/UX, backend handles business logic
2. **Scalability**: Can add mobile apps or third-party integrations using same APIs
3. **Security**: JWT authentication protects sensitive endpoints
4. **Data Consistency**: Centralized database ensures all clients see same information
5. **Maintainability**: Modular structure makes updates easier
6. **Error Handling**: Standardized HTTP status codes (200, 400, 401, 404, 500)

**Integration Synergy:**
- Google OAuth generates user data → Stored via internal APIs
- Order creation (internal API) → Triggers email (Nodemailer API)
- Avatar selection (DiceBear API) → Saved via internal profile API
- Order placement → Real-time notification (Socket.IO) → Admin dashboard update
- Admin creates product → Autocomplete searches TheCocktailDB/TheMealDB → Product saved via internal API
- Product seeding → TheCocktailDB/TheMealDB fetch data → Internal API stores in database""

---

### How API Integration Works - Complete Order Flow Example
> "Let me demonstrate how **external and internal APIs work together** in a complete order placement:

**Step 1: Customer Authentication (External API)**
- Customer clicks 'Sign in with Google'
- **Google OAuth API** handles authentication
- Returns user credentials (email, name, picture)
- **Internal API**: `POST /api/customer/auth/login` creates session
- JWT token issued (7-day expiry)

**Step 2: Browse Products (Internal API)**
- Frontend: `GET /api/customer/products?category=Coffee`
- Backend queries SQLite database
- Returns JSON: `{ products: [{id: 1, name: 'Espresso', price: 120}] }`
- Products displayed with **DiceBear Avatar API** for user profile icon

**Step 3: Add to Cart (Client-side)**
- Cart stored in browser's localStorage (no API call)
- Format: `{items: [{productId: 1, quantity: 2, price: 120}], total: 240}`

**Step 4: Place Order (Internal API)**
- Frontend: `POST /api/customer/orders`
- Backend creates order record in database
- Returns: `{orderId: 'ORD-12345', total: 240, status: 'pending'}`

**Step 5: Payment OTP (External + Internal APIs)**
- **Internal API**: `POST /api/customer/payments/initiate-otp`
- Backend generates 6-digit OTP code
- **Nodemailer API** sends email with OTP
- Customer receives email: "Your verification code is: 123456"

**Step 6: Verify Payment (Internal API)**
- Customer enters OTP in frontend
- Frontend: `POST /api/customer/payments/confirm-otp`
- Backend validates OTP, creates payment record
- Order status updated to 'completed'

**Step 7: Real-time Notification (External API)**
- **Socket.IO WebSocket** emits event: `io.emit('newOrder', {orderId, customer})`
- Admin dashboard receives instant notification
- Notification bell badge updates without refresh

**Step 8: Email Receipt (External API)**
- **Nodemailer API** sends receipt email
- Contains order details, payment info, QR code
- Professional HTML-formatted email

**Total APIs Involved: 5 External + 4 Internal = 9 API calls for one complete transaction**"

---

### Authentication & Security
> "Our API security uses **JWT (JSON Web Tokens)**:

- **Customer tokens**: 7-day expiry for convenience
- **Admin tokens**: 24-hour expiry for enhanced security
- **Token structure**: `{id, email, username, role, iat, exp}`
- **Protected routes**: Middleware validates token before processing request
- **Example protected endpoint**:
  ```javascript
  router.get('/orders', authenticateToken, async (req, res) => {
    const userId = req.user.id; // Extracted from validated JWT
    // Only return orders for this specific user
  })
  ```

This prevents unauthorized access - customers can only see their own orders, admins can see everything."

---

## 📌 Part 3: LIVE SYSTEM DEMONSTRATION (5-6 minutes)

### Demo Setup
> "Now let's see these APIs in action with a live demonstration. I have three terminal windows running:
> 
> 1. **Backend Server** (Port 3000) - Handling API requests
> 2. **Customer Frontend** (Port 5173) - Customer interface
> 3. **Admin Dashboard** (Port 5174) - Café management interface"

### Customer Journey Demo
> "I'll demonstrate as a customer placing an order:

**1. Login/Registration** (Show both methods)
- Google OAuth login → API: `POST /auth/google-login`
- Traditional email login → API: `POST /auth/login`
- _(Show the splash screen animation that appears on every page load)_

**2. Browse Products**
- Navigate to Menu page → API: `GET /products?category=All`
- Use search functionality → API: `GET /products?search=coffee`
- Filter by category → API: `GET /products?category=Beverages`

**3. Add to Cart**
- Click 'Add to Cart' → Stored in localStorage, no API call
- Cart icon updates with quantity badge
- Open floating cart widget → Shows cart summary

**4. Checkout Process**
- Review cart items, enter delivery details
- Select payment method (Bank Transfer)
- Submit order → API: `POST /orders`
- _(Show success modal and order confirmation)_

**5. Payment Verification**
- API: `POST /payments/initiate-otp` → Email sent
- _(Check email for OTP code)_
- Enter OTP → API: `POST /payments/confirm-otp`
- _(Show payment success modal and receipt)_

**6. View Order History**
- Navigate to Orders page → API: `GET /orders`
- Click order details → API: `GET /orders/:id`
- _(Show order status, items, payment info, receipt download)_"

### Admin Dashboard Demo
> "Now switching to the admin perspective:

**1. Real-time Notification**
- _(Point to notification bell in header)_
- 'New order received via WebSocket'
- Click notification → Navigates to Orders page

**2. Dashboard Analytics**
- API: `GET /stats/dashboard`
- Shows: Total revenue, total orders, customer count, product count
- _(Point out we removed the percentage indicators as requested)_
- Revenue chart, top products, top customers, recent orders

**3. Order Management**
- API: `GET /orders`
- Search by order ID, username, or email → Real-time filtering
- Click order → API: `GET /orders/:id`
- Update status from 'Pending' to 'Processing' → API: `PATCH /orders/:id/status`
- Change to 'Completed' → Triggers notification to customer

**4. Product Management**
- API: `GET /products`
- Create new product → API: `POST /products` (with image upload)
- Edit existing product → API: `PUT /products/:id`
- Deactivate product → API: `DELETE /products/:id` (soft delete)

**5. Customer Management**
- API: `GET /customers`
- View customer list with deactivation status (red badges)
- Search for specific customer
- Click customer → API: `GET /customers/:id` (order history, total spent)

**6. Point of Sale (POS)**
- Search customer → API: `GET /pos/customers/search`
- Add products to order
- Process walk-in payment → API: `POST /pos/order`
- View today's summary → API: `GET /pos/summary/today`"

### Special Features Demo
> "Let me highlight some unique features:

**Account Deactivation & Reactivation:**
- Customer side: Profile page → 'Deactivate Account'
- Type 'DEACTIVATE' in confirmation modal → API: `DELETE /settings/account`
- _(Show success modal)_
- Logout automatically
- Try to login → API: `POST /auth/login` (detects deactivation)
- Reactivation modal appears → Type 'REACTIVATE' → API: `POST /auth/reactivate`
- Automatically logged back in

**Admin View of Deactivated Accounts:**
- Customers page → Red 'Deactivated' badges
- POS customer search → Shows deactivation status
- Orders still visible with full history preserved

**Contact Form:**
- Customer sends message → API: `POST /contact`
- Form preserves logged-in user's name and email after submission"

---

## 📌 Part 4: TECHNICAL HIGHLIGHTS (2 minutes)

### Technology Integration
> "Our system integrates multiple technologies seamlessly:

**Frontend Technologies:**
- **React 19.2.0**: Component-based UI with hooks (useState, useEffect, useContext)
- **Tailwind CSS**: Utility-first styling for consistent design
- **Framer Motion**: Smooth animations (modals, splash screen, page transitions)
- **Lucide React**: Consistent icon library (UtensilsCrossed throughout)
- **Recharts**: Interactive dashboard charts (area, bar, pie charts)

**Backend Technologies:**
- **Express.js**: RESTful API routing and middleware
- **SQLite**: Lightweight relational database with migrations
- **JSON Web Tokens**: Secure authentication with role-based access
- **Socket.IO**: WebSocket server for real-time notifications
- **Nodemailer**: Email service for OTP and receipts
- **Bcrypt**: Password hashing for security

**Development Tools:**
- **Vite**: Fast development server and build tool
- **ESLint**: Code quality and consistency
- **Git**: Version control with feature branches"

### Code Quality & Best Practices
> "We followed industry best practices:
- **RESTful API design**: Meaningful endpoints, proper HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **Error handling**: Try-catch blocks, standardized error responses
- **Input validation**: Request body validation before database operations
- **Security**: JWT verification, SQL injection prevention, CORS configuration
- **Code organization**: Modular routing (separated by feature), reusable services
- **Database design**: Normalized schema, soft deletes, foreign key relationships
- **Session management**: Token refresh on verify, localStorage persistence
- **Responsive design**: Mobile-friendly layouts using Tailwind breakpoints"

---

## 📌 Part 5: PROJECT CHALLENGES & SOLUTIONS (1-2 minutes)

### Challenges Faced
> "During development, we encountered several technical challenges:

**Challenge 1: Modal Display Issue**
- Problem: Success modals not showing after login
- Root cause: PublicRoute component auto-redirected before modal rendered
- Solution: Delayed authentication state update until after modal displays for 2 seconds

**Challenge 2: Account Deactivation Flow**
- Problem: Needed user confirmation to prevent accidental deletions
- Solution: Implemented confirmation modals requiring exact text ('DEACTIVATE'/'REACTIVATE')
- Used soft delete pattern to preserve order history

**Challenge 3: Real-time Notifications**
- Problem: Admin dashboard needed instant order updates
- Solution: Integrated Socket.IO WebSocket connections for bi-directional communication

**Challenge 4: OTP Verification**
- Problem: SMS API costs for testing
- Solution: Console-based demo OTP for development, email OTP for production

**Challenge 5: Search Functionality**
- Problem: Search needed to be precise and performant
- Solution: Implemented parameterized SQL queries with LIKE operators for ID, username, and email"

---

## 📌 Part 6: CONCLUSION (1 minute)

### System Summary
> "To summarize, UniCafe successfully demonstrates a modern client-server architecture with:
> 
> ✅ **45+ RESTful API endpoints** serving two frontend applications  
> ✅ **Real-time communication** via WebSocket for instant updates  
> ✅ **Secure authentication** using JWT with role-based access control  
> ✅ **Complete business workflow** from product browsing to payment processing  
> ✅ **Admin analytics** with interactive charts and comprehensive reporting  
> ✅ **Account management** including deactivation and reactivation flows  
> ✅ **Responsive UI** with smooth animations and professional design"

### Future Enhancements
> "Potential improvements for production deployment:
- Mobile app integration using the same API backend
- Payment gateway integration (PayMongo, PayPal, GCash API)
- Advanced analytics with sales forecasting
- Inventory management system
- Loyalty program and customer rewards
- Multi-branch support
- Email marketing integration"

### Closing Statement
> "Our API-driven architecture makes UniCafe **scalable, secure, and maintainable**. The clear separation between frontend presentation and backend logic allows independent development and easy integration of future features.
> 
> Thank you for your attention. We're now open to questions about our system architecture, API design, or any specific features you'd like to explore further."

---

## 🎯 Key Points to Emphasize

### For API Integration Scoring (10%):
- **6 External API integrations**: Google OAuth, Nodemailer, DiceBear Avatars, Socket.IO, TheCocktailDB, TheMealDB
- **Clear explanation** of how each external API enhances the system
- **Product database APIs**: TheCocktailDB for drinks, TheMealDB for food/meals
- **Autocomplete functionality**: Admins search external APIs when adding products
- **45+ internal RESTful endpoints** organized by feature
- **Real-world example flow** showing both external and internal API coordination
- **Benefits clearly stated**: Security, scalability, professional features, cost-effectiveness, rich content
- **Integration synergy**: How APIs work together (OAuth → Email → Real-time updates → Product seeding)

### For Clarity and Structure Scoring (10%):
- **Clear introduction** with team and project overview
- **Logical flow**: Introduction → API Explanation → Demo → Technical Details → Challenges → Conclusion
- **Live demonstration** showing complete customer and admin workflows
- **Technical highlights** explaining technology choices
- **Professional conclusion** with summary and future enhancements

---

## 📝 Presentation Tips

1. **Keep browser tabs ready**: Customer app, Admin dashboard, Email inbox
2. **Prepare demo data**: Products, test customer account, sample orders
3. **Test everything before presenting**: Login, checkout, notifications
4. **Speak clearly and confidently**: Look at audience, not just screen
5. **Manage time**: Spend appropriate time on each section (use timer)
6. **Handle questions professionally**: If unsure, say you'll research and follow up
7. **Show enthusiasm**: Demonstrate pride in your work
8. **Have backup plan**: Screenshots ready in case live demo fails

---

**Good luck with your presentation! 🎉**
