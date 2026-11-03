# Swiggy Clone Backend – Role-Based Order Management System

A production-grade, backend-only food ordering and restaurant management platform inspired by Swiggy, built using Node.js, Express.js, MongoDB, and Mongoose. The system features a clean MVC architecture, robust Role-Based Access Control (RBAC), multi-layered admin security, JWT authentication with refresh token rotation, cart management, and a complete order lifecycle engine.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Architecture & Folder Structure](#architecture--folder-structure)
- [Key Features](#key-features)
- [User Roles & Permissions](#user-roles--permissions)
- [Authentication Workflow](#authentication-workflow)
- [Admin Secret-Key Security](#admin-secret-key-security)
- [Environment Setup](#environment-setup)
- [Installation & Running](#installation--running)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication-apis)
  - [Restaurants](#restaurant-apis)
  - [Food Items](#food-apis)
  - [Categories](#category-apis)
  - [Cart](#cart-apis)
  - [Orders](#order-apis)
  - [Admin Management](#admin-apis)
- [Error Handling & Response Format](#error-handling--response-format)

---

## Overview

This project provides a robust, scalable backend for a multi-vendor food delivery service. It handles everything from user registration and token rotation to restaurant management, menu creation, cart operations, strict single-vendor cart isolation, order status lifecycle workflows, and administrative control.

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Security & Headers**: `helmet`, `cors`, `cookie-parser`, `express-rate-limit`
- **Validation**: Joi
- **Logging**: Morgan

---

## Architecture & Folder Structure

The project strictly follows the industry-standard **Model-View-Controller (MVC)** architectural pattern:

```text
swiggy-clone-backend/
├── config/
│   └── db.js                      # MongoDB connection setup
├── controllers/
│   ├── authController.js          # Authentication & token rotation logic
│   ├── adminController.js         # User blocking, statistics, admin queries
│   ├── restaurantController.js   # Restaurant CRUD & open/active status
│   ├── foodController.js          # Menu item CRUD & filtering
│   ├── categoryController.js      # Food category management
│   ├── cartController.js          # Cart items, isolation & total calculation
│   └── orderController.js         # Unified order lifecycle & transitions
├── models/
│   ├── User.js                    # User schema with bcrypt password hashing
│   ├── Restaurant.js              # Restaurant details & ownership
│   ├── Food.js                    # Food items with category & restaurant refs
│   ├── Category.js                # Food categories
│   ├── Cart.js                    # Single active cart per user
│   ├── Order.js                   # Snapshot-based order schema
│   └── RefreshToken.js            # Stored hashed refresh tokens
├── routes/
│   ├── authRoutes.js              # /api/auth endpoints
│   ├── adminRoutes.js             # /api/admin endpoints
│   ├── restaurantRoutes.js        # /api/restaurants endpoints
│   ├── foodRoutes.js              # /api/foods endpoints
│   ├── categoryRoutes.js          # /api/categories endpoints
│   ├── cartRoutes.js              # /api/cart endpoints
│   └── orderRoutes.js             # /api/orders endpoints
├── middleware/
│   ├── authMiddleware.js          # Bearer JWT verification & blocked user check
│   ├── roleMiddleware.js          # Role-based authorization ('admin', 'owner', 'user')
│   ├── adminSecretMiddleware.js   # 'x-admin-secret' header authorization
│   ├── errorMiddleware.js         # Centralized error handler & 404 handler
│   └── validateMiddleware.js      # Joi schema validation runner
├── validators/
│   ├── authValidator.js           # Joi schemas for registration and login
│   ├── restaurantValidator.js     # Joi schemas for restaurant creation/updates
│   ├── foodValidator.js           # Joi schemas for food items & availability
│   ├── categoryValidator.js       # Joi schemas for categories
│   └── orderValidator.js          # Joi schemas for cart & orders
├── utils/
│   ├── generateTokens.js          # JWT generation & SHA-256 token hashing
│   ├── ApiError.js                # Custom operational error class
│   └── asyncHandler.js            # Async error-wrapping higher-order function
├── .env                           # Environment secrets (git-ignored)
├── .env.example                   # Example environment configuration
├── .gitignore                     # Git ignore rules
├── app.js                         # Express app configuration & middleware
├── server.js                      # Server startup & DB initialization
├── package.json                   # Dependencies and scripts
└── README.md                      # Complete documentation
```

---

## Key Features

1. **Role-Based Access Control**:
   - Distinct roles: `user`, `owner`, and `admin`.
   - Public registration strictly enforces the `user` role to prevent privilege escalation.
2. **Double-Layer Admin Authorization**:
   - Admin routes require both a valid JWT with the `admin` role **and** a secret header `x-admin-secret` matching `ADMIN_SECRET_KEY`.
3. **Secure Authentication & Token Rotation**:
   - Short-lived Access Tokens (15m) returned in JSON payload.
   - Long-lived Refresh Tokens (7d) delivered via secure `HttpOnly` cookies.
   - Refresh tokens are hashed using SHA-256 before storage in MongoDB.
   - Automatic token rotation upon refresh; old tokens are revoked immediately.
4. **Restaurant & Menu Management**:
   - Enforces a one-restaurant-per-owner constraint.
   - Strict resource ownership checks ensure owners can only alter their own restaurant and food items.
5. **Cart Isolation**:
   - Enforces single-restaurant ordering (users cannot mix dishes from multiple restaurants in one cart).
   - Real-time availability checks and server-side subtotal calculation.
6. **Order Snapshot Engine & State Machine**:
   - Food names and prices are captured as immutable snapshots upon order placement.
   - Total amount is computed strictly on the backend; client-provided totals are ignored.
   - Strict status lifecycle transitions:
     - `Pending` → `Accepted` or `Rejected`
     - `Accepted` → `Preparing`
     - `Preparing` → `Out for Delivery`
     - `Out for Delivery` → `Delivered`
   - Customers can only cancel an order while it remains in `Pending` status.
7. **Search, Pagination & Filtering**:
   - Search by name, filter by cuisine, veg/non-veg, category, and price range with pagination metadata (`currentPage`, `totalPages`, `totalItems`).

---

## User Roles & Permissions

| Role | Description | Permissions |
|---|---|---|
| **User** (`user`) | Normal customer | Browse restaurants/food, search/filter, manage cart, place orders, view personal orders, cancel pending orders. |
| **Restaurant Owner** (`owner`) | Restaurant vendor | Register one restaurant, manage own restaurant details, manage menu items, manage availability, view restaurant orders, accept/reject orders, progress order statuses. |
| **Admin** (`admin`) | Platform administrator | Manage all users (block/unblock), view all restaurants, view all platform orders, create/update/delete food categories, view platform analytics and revenue. |

---

## Authentication Workflow

```
[ Client ] -- 1. POST /api/auth/register --> [ Server (creates User: role='user') ]
[ Client ] -- 2. POST /api/auth/login ------> [ Server (verifies hash, creates JWT + Refresh Token) ]
           <-- Access Token (JSON) & Refresh Token (HttpOnly Cookie) --
[ Client ] -- 3. Request with Authorization: Bearer <token> --> [ Protected API ]
[ Client ] -- 4. POST /api/auth/refresh-token (Cookie) -------> [ Server (rotates token pair) ]
[ Client ] -- 5. POST /api/auth/logout -----------------------> [ Server (revokes refresh token & clears cookie) ]
```

---

## Admin Secret-Key Security

All `/api/admin/*` endpoints and category modifications (`POST`, `PUT`, `DELETE` on `/api/categories`) require an additional security header:

```http
x-admin-secret: <your-ADMIN_SECRET_KEY>
```

If the header is missing or does not match `process.env.ADMIN_SECRET_KEY`, the request is immediately rejected with HTTP `403 Forbidden`.

---

## Environment Setup

Create a `.env` file in the root directory (or copy from `.env.example`):

```bash
cp .env.example .env
```

Populate the required configuration variables:

```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/swiggy-clone?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
ADMIN_SECRET_KEY=your_admin_secret_key_here
CLIENT_URL=http://localhost:3000
```

---

## Installation & Running

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run in development mode (with nodemon)**:
   ```bash
   npm run dev
   ```

3. **Run in production mode**:
   ```bash
   npm start
   ```

The server will connect to MongoDB first and listen on the configured `PORT` (default: 5000).

---

## API Documentation

### Authentication APIs

#### 1. Register User
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "phone": "9876543210"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "user": {
        "id": "6701a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210",
        "role": "user"
      }
    }
  }
  ```

#### 2. Login User
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": "6701a1b2c3d4e5f6a7b8c9d0",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "9876543210",
        "role": "user"
      },
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
  *(Sets `refreshToken` in HttpOnly cookie)*

#### 3. Refresh Access Token
- **Method**: `POST`
- **Endpoint**: `/api/auth/refresh-token`
- **Access**: Public (Requires `refreshToken` cookie or body)
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### 4. Logout
- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Access**: Public
- **Response** (`200 OK`):
  ```json
  {
    "success": true,
    "message": "Logged out successfully",
    "data": {}
  }
  ```

---

### Restaurant APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/restaurants` | Owner, Admin | Create restaurant (1 per owner) |
| `GET` | `/api/restaurants` | Public | List active restaurants (supports `search`, `cuisine`, `isOpen`, `page`, `limit`) |
| `GET` | `/api/restaurants/:id` | Public | Get single restaurant details |
| `PUT` | `/api/restaurants/:id` | Owner, Admin | Update restaurant details (ownership checked) |
| `PATCH` | `/api/restaurants/:id/status` | Owner, Admin | Toggle `isOpen` (Owner) or `isActive` (Admin) |

---

### Food APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/foods` | Owner, Admin | Add food item to owned restaurant |
| `GET` | `/api/foods` | Public | List food items (supports `search`, `restaurant`, `category`, `isVeg`, `minPrice`, `maxPrice`, `isAvailable`, `page`, `limit`) |
| `GET` | `/api/foods/:id` | Public | Get food item details |
| `PUT` | `/api/foods/:id` | Owner, Admin | Update food item (ownership checked) |
| `DELETE` | `/api/foods/:id` | Owner, Admin | Delete food item (ownership checked) |
| `PATCH` | `/api/foods/:id/availability` | Owner, Admin | Toggle `isAvailable` status |

---

### Category APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/categories` | Public | List all categories |
| `GET` | `/api/categories/:id` | Public | Get category details |
| `POST` | `/api/categories` | Admin + Secret | Create category |
| `PUT` | `/api/categories/:id` | Admin + Secret | Update category |
| `DELETE` | `/api/categories/:id` | Admin + Secret | Delete category (blocked if foods are attached) |

---

### Cart APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | User | Get current user's cart with subtotal & restaurant info |
| `POST` | `/api/cart/add` | User | Add food to cart (enforces single-vendor rule) |
| `PUT` | `/api/cart/update` | User | Update quantity (removes if quantity is 0) |
| `DELETE` | `/api/cart/remove/:foodId` | User | Remove specific food item from cart |
| `DELETE` | `/api/cart/clear` | User | Clear entire cart |

---

### Order APIs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | User | Place order from cart (computes total, snapshots prices) |
| `GET` | `/api/orders/my-orders` | User | Get authenticated user's order history |
| `GET` | `/api/orders/:id` | User, Owner, Admin | Get order details (ownership checked) |
| `PATCH` | `/api/orders/:id/cancel` | User | Cancel order (only allowed when `Pending`) |
| `GET` | `/api/orders/restaurant/:restaurantId` | Owner, Admin | View orders for a specific restaurant |
| `PATCH` | `/api/orders/:id/accept` | Owner, Admin | Accept a pending order |
| `PATCH` | `/api/orders/:id/reject` | Owner, Admin | Reject a pending order |
| `PATCH` | `/api/orders/:id/status` | Owner, Admin | Progress status (`Accepted` → `Preparing` → `Out for Delivery` → `Delivered`) |

---

### Admin APIs

All admin routes require `Authorization: Bearer <admin_token>` and `x-admin-secret: <ADMIN_SECRET_KEY>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | List all users with `search`, `role`, `isBlocked`, and pagination |
| `PATCH` | `/api/admin/users/:id/block` | Block a user account |
| `PATCH` | `/api/admin/users/:id/unblock` | Unblock a user account |
| `GET` | `/api/admin/restaurants` | View all platform restaurants (active & inactive) |
| `GET` | `/api/admin/orders` | View all platform orders with status filter & pagination |
| `GET` | `/api/admin/statistics` | Aggregated platform metrics (users, owners, revenue, etc.) |

**Example Statistics Response (`GET /api/admin/statistics`)**:
```json
{
  "success": true,
  "message": "Platform statistics retrieved successfully",
  "data": {
    "totalRegisteredUsers": 45,
    "totalRestaurantOwners": 12,
    "totalRestaurants": 12,
    "totalFoodItems": 180,
    "totalOrders": 320,
    "totalDeliveredOrders": 290,
    "totalRevenue": 142580.5
  }
}
```

---

## Error Handling & Response Format

### Success Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Paginated Response Format
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [],
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 48
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

### Common HTTP Status Codes
- `200 OK`: Request succeeded.
- `201 Created`: Resource successfully created.
- `400 Bad Request`: Malformed request, invalid status transition, or business rule violation.
- `401 Unauthorized`: Missing or invalid JWT / refresh token.
- `403 Forbidden`: Insufficient role permissions, missing admin secret, or account blocked.
- `404 Not Found`: Resource or route not found.
- `409 Conflict`: Duplicate email, duplicate restaurant for owner, or duplicate category name.
- `422 Unprocessable Entity`: Request body failed Joi validation.
- `500 Internal Server Error`: Unexpected server issue.
