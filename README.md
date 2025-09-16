# Product Store MERN Stack 🚀

A full-stack e-commerce application built with the MERN stack following clean architecture principles. Features modern React frontend, robust Express.js backend, and comprehensive admin panel.

## ✨ Features

### 🎨 Frontend (React + Vite)
- **Modern React 19** with hooks and functional components
- **Tailwind CSS v4** for responsive, mobile-first design
- **Framer Motion** for smooth animations and transitions
- **React Router v7** for client-side routing
- **Radix UI** components for accessibility
- **Real-time search** with debouncing
- **Advanced filtering** and sorting
- **Shopping cart** and wishlist functionality
- **Responsive design** across all devices
- **Dark/light theme** support

### ⚙️ Backend (Node.js + Express)
- **Clean architecture** with separation of concerns
- **JWT authentication** with refresh tokens
- **Role-based authorization** (admin/customer)
- **Input validation** with Joi schemas
- **Rate limiting** and security headers
- **Structured logging** with Winston
- **Error handling** middleware
- **MongoDB** with Mongoose ODM
- **RESTful API** design

### 🛡️ Security Features
- **Helmet.js** for security headers
- **CORS** configuration
- **Input sanitization** to prevent injection
- **Password hashing** with bcrypt
- **JWT tokens** in HTTP-only cookies
- **Rate limiting** by IP and user

### 📊 Admin Features
- **Product management** (CRUD operations)
- **User management** and role assignment
- **Order processing** and status updates
- **Analytics dashboard** with statistics
- **Inventory tracking** and low stock alerts
- **Revenue analytics** and reporting

## 🏗️ Architecture

```
product-store-mern-stack/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   └── context/        # React context providers
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic layer
│   │   ├── repositories/   # Data access layer
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API route definitions
│   │   ├── middlewares/    # Custom middleware
│   │   ├── validators/     # Input validation schemas
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration files
└── docs/                   # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Install
```bash
# Clone repository
git clone <your-repo-url>
cd product-store-mern-stack

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Update the `.env` file with your values:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=your-mongodb-connection-string
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

**Frontend (.env):**
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

### 3. Start Development

```bash
# Start both frontend and backend
npm run dev

# Or start individually
npm run dev:backend  # Backend only
npm run dev:frontend # Frontend only
```

### 4. Access the Application

- **Frontend**: http://localhost:3000 or http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📖 API Documentation

### Authentication
```http
POST /api/auth/register     # Register new user
POST /api/auth/login        # Login user
POST /api/auth/logout       # Logout user
POST /api/auth/refresh-token # Refresh access token
GET  /api/auth/profile      # Get user profile
```

### Products
```http
GET    /api/products           # Get all products
GET    /api/products/:id       # Get single product
POST   /api/products           # Create product (admin)
PUT    /api/products/:id       # Update product (admin)
DELETE /api/products/:id       # Delete product (admin)
GET    /api/products/search    # Search products
GET    /api/products/featured  # Get featured products
```

### Orders
```http
GET    /api/orders            # Get all orders (admin)
POST   /api/orders            # Create new order
GET    /api/orders/:id        # Get order by ID
PATCH  /api/orders/:id/status # Update order status (admin)
DELETE /api/orders/:id/cancel # Cancel order
```

### Users
```http
GET    /api/users/profile     # Get user profile
PUT    /api/users/profile     # Update profile
GET    /api/users/cart        # Get shopping cart
POST   /api/users/cart        # Add to cart
DELETE /api/users/cart/:id    # Remove from cart
```

## 🔧 Development

### Available Scripts

**Root level:**
```bash
npm run dev          # Start both frontend and backend
npm run build        # Build frontend for production
npm start            # Start production server
npm run install:all  # Install all dependencies
npm run clean        # Clean all node_modules
```

**Backend:**
```bash
npm run dev         # Start development server
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```

**Frontend:**
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Code Structure

**Backend follows Clean Architecture:**
- **Controllers**: Handle HTTP requests/responses
- **Services**: Business logic and rules
- **Repositories**: Data access layer
- **Models**: Database schemas
- **Middlewares**: Request processing
- **Validators**: Input validation

**Frontend follows Component-based Architecture:**
- **Components**: Reusable UI components
- **Pages**: Route-specific components
- **Hooks**: Custom React hooks
- **Services**: API communication
- **Utils**: Helper functions

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 📦 Deployment

### Backend Deployment
1. Set environment variables
2. Build and start: `npm start`
3. Use PM2 for process management

### Frontend Deployment
1. Build: `npm run build`
2. Deploy `dist/` folder to CDN/static hosting
3. Configure environment variables

### Docker Support (Optional)
```bash
# Build images
docker-compose build

# Start services
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React Team for the amazing framework
- Express.js community for the robust backend framework
- MongoDB for the flexible database
- All open-source contributors

---

**Built with ❤️ using the MERN stack**
