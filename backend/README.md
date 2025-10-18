# Glide Shop Backend API

A comprehensive Node.js/Express backend for an e-commerce platform with MongoDB, JWT authentication, and full CRUD operations.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - User registration/login
  - Password reset via email
  - Role-based access control (Admin/Customer)
  - Email verification

- 🛍️ **E-commerce Features**
  - Product management (CRUD)
  - Shopping cart functionality
  - Order management with status tracking
  - Product search and filtering
  - Category and brand management
  - Product reviews and ratings

- 🛡️ **Security & Performance**
  - Rate limiting
  - Input validation
  - CORS protection
  - Helmet security headers
  - Compression
  - Error handling

- 📧 **Email Services**
  - Email verification
  - Password reset
  - Order confirmations
  - Order status updates

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **Email**: Nodemailer
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Language**: TypeScript

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/glide_shop
   JWT_SECRET=your-super-secret-jwt-key
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-email` - Verify email

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories` - Get categories
- `GET /api/products/featured` - Get featured products
- `GET /api/products/search` - Search products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/admin/all` - Get all orders (Admin)
- `GET /api/orders/admin/stats` - Get order statistics (Admin)
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:itemId` - Update cart item
- `DELETE /api/cart/items/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `GET /api/cart/count` - Get cart item count

## Database Models

### User
- Personal information (name, email, phone)
- Authentication (password, tokens)
- Address information
- Role and permissions
- Email verification status

### Product
- Product details (name, description, price)
- Inventory management (stock tracking)
- Categories and variants
- Images and specifications
- SEO and ratings

### Order
- Order information and status
- Customer and shipping details
- Payment information
- Order items and pricing
- Tracking and delivery

### Cart
- User cart with items
- Quantity and variant selection
- Automatic expiration
- Price calculations

### Review
- Product reviews and ratings
- User verification
- Helpful votes
- Admin responses

## Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/glide_shop

# Server
PORT=4000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on all routes
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Session management
- Error handling without sensitive data exposure

## Error Handling

The API uses a centralized error handling system that:
- Catches and formats all errors consistently
- Provides meaningful error messages
- Logs errors for debugging
- Returns appropriate HTTP status codes
- Hides sensitive information in production
