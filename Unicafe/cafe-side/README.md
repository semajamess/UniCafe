# UniCafé Cafe Side (Admin Dashboard)

A modern, professional admin dashboard for managing your cafe business. Built with React, Vite, TailwindCSS, and Recharts.

## 🚀 Features

### ✅ Complete Pages
- **Dashboard** - Analytics overview with charts and statistics
- **Products** - Full CRUD operations (Create, Read, Update, Delete)
- **Orders** - Order management with status tracking
- **Categories** - Product category management
- **Customers** - Customer database and information
- **Analytics** - Detailed business insights and charts
- **Settings** - Store configuration and preferences
- **Login** - Secure authentication page

### 🎨 Design Features
- Modern, clean UI with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Professional color scheme
- Interactive charts with Recharts
- Lucide icons for crisp visuals
- Accessible components

### 🛠️ Technical Features
- React 19.2.0 with hooks
- React Router v7 for navigation
- Vite for fast development
- TailwindCSS v4 for styling
- Recharts for data visualization
- Date-fns for date formatting
- ESLint for code quality

## 📦 Installation

1. Navigate to the cafe-side directory:
```bash
cd Unicafe/cafe-side
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit:
```
http://localhost:5174
```

## 🔐 Demo Credentials

**Email:** admin@unicafe.com  
**Password:** admin123

## 📁 Project Structure

```
cafe-side/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar
│   │   └── Sidebar.jsx         # Side navigation menu
│   ├── layouts/
│   │   └── AdminLayout.jsx     # Main layout wrapper
│   ├── front-end/
│   │   ├── Dashboard.jsx       # Analytics dashboard
│   │   ├── Products.jsx        # Product management (CRUD)
│   │   ├── Orders.jsx          # Order management
│   │   ├── Categories.jsx      # Category management
│   │   ├── Customers.jsx       # Customer list
│   │   ├── Analytics.jsx       # Charts and insights
│   │   ├── Settings.jsx        # Store settings
│   │   └── Login.jsx           # Authentication
│   ├── App.jsx                 # Main app component
│   ├── main.jsx               # App entry point
│   └── index.css              # Global styles
├── index.html
├── package.json
├── vite.config.js
└── eslint.config.js
```

## 🎯 Key Functionalities

### Products Management
- ✅ Add new products with image, price, cost, stock
- ✅ Edit existing products
- ✅ Delete products with confirmation
- ✅ Search and filter by category
- ✅ Real-time stock status indicators
- ✅ Low stock warnings

### Orders Management
- ✅ View all orders with details
- ✅ Filter by status (pending, processing, completed, etc.)
- ✅ Order status management
- ✅ View customer information
- ✅ Calculate totals and tax
- ✅ Order timeline tracking

### Categories Management
- ✅ Create custom categories
- ✅ Assign colors and icons
- ✅ Edit category details
- ✅ Delete categories
- ✅ Product count per category

### Dashboard Analytics
- ✅ Revenue overview
- ✅ Order statistics
- ✅ Customer metrics
- ✅ Top selling products
- ✅ Recent orders feed
- ✅ Interactive charts

## 🎨 Animations & UX

- Smooth page transitions
- Card hover effects
- Button interactions
- Modal animations
- Loading states
- Skeleton loaders (ready to implement)
- Toast notifications (ready to implement)

## 🔄 Future Backend Integration

This frontend is ready to connect to a backend API. Key integration points:

```javascript
// Example API calls (to be implemented)
- GET    /api/products
- POST   /api/products
- PUT    /api/products/:id
- DELETE /api/products/:id
- GET    /api/orders
- PATCH  /api/orders/:id/status
- GET    /api/analytics
```

## 🛡️ Security Features (Ready for Backend)

- Authentication state management
- Protected routes
- Token-based auth (ready to implement)
- Role-based access control (ready to implement)
- Secure API communication (ready to implement)

## 📱 Responsive Design

- Mobile: Optimized sidebar and layouts
- Tablet: Adjusted grid layouts
- Desktop: Full feature display
- Touch-friendly buttons and controls

## 🎯 Best Practices

- ✅ Modular component structure
- ✅ Reusable components
- ✅ Clean code organization
- ✅ Proper state management
- ✅ Error handling ready
- ✅ Form validation
- ✅ Accessibility considerations
- ✅ Performance optimized

## 🚀 Production Build

```bash
npm run build
npm run preview
```

## 📄 License

MIT License - feel free to use this for your projects!

## 👨‍💻 Developer Notes

This is a **frontend-only** implementation. To make it fully functional:

1. Set up a backend API (Node.js/Express, Python/Django, etc.)
2. Connect API endpoints to frontend functions
3. Implement authentication middleware
4. Add database integration
5. Set up environment variables
6. Deploy to production

---

Built with ❤️ for UniCafé
