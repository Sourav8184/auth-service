# 🔐 Auth Service

Centralized authentication and authorization microservice for the Flight Management System.

**Port:** 3002 | **Database:** Shared MySQL (Flights DB) | **ORM:** Sequelize

---

## 📋 Table of Contents

- [Service Overview](#service-overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Authentication Flow](#authentication-flow)
- [Integration Guide](#integration-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Service Overview

**Auth Service** is the centralized authentication hub for the entire Flight Management System. It handles user registration, login, JWT token management, and role-based access control.

### Key Responsibilities

✅ User registration with email validation  
✅ Secure user login with password verification  
✅ JWT token generation and management  
✅ Token refresh functionality  
✅ Role-based access control (admin, user)  
✅ User profile and account management  
✅ Cross-service token verification

---

## Features

### 1. User Registration

- Email validation and uniqueness
- Password hashing (bcryptjs - 10 rounds)
- Automatic JWT token generation
- Default user role assignment

### 2. User Login

- Email and password authentication
- Password comparison with hash
- JWT and refresh token generation
- User role information in response

### 3. Token Management

- Access tokens (7 days expiry)
- Refresh tokens (30 days expiry)
- HS256 signature algorithm
- Token verification for other services

### 4. Role-Based Access Control

- **user** role - Regular user access
- **admin** role - Full system access
- Middleware-based authorization

### 5. User Management

- Get user information
- Update user roles (admin only)
- Activate/deactivate accounts (admin only)
- Timestamp tracking

---

## Technology Stack

- **Runtime:** Node.js v14+
- **Framework:** Express.js v4.18.2
- **Database:** MySQL 5.7+
- **ORM:** Sequelize v6.35.0
- **Authentication:** JWT (jsonwebtoken v9.0.0)
- **Security:** bcryptjs v2.4.3
- **Logging:** Winston v3.11.0
- **Code Formatter:** Prettier

---

## Installation & Setup

### Prerequisites

```bash
# Verify Node.js (v14+)
node --version

# Verify npm (v6+)
npm --version

# Verify MySQL (5.7+)
mysql --version
```

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file:

```bash
PORT=3002
NODE_ENV=development
JWT_SECRET=<your-generated-secret-key>
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
```

⚠️ **Important:** Generate a strong JWT_SECRET using `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and keep it secure.

### Step 3: Database Setup

```bash
# Create database
mysql -u <your-username> -p -e "CREATE DATABASE Flights;"

# Run migrations
npx sequelize-cli db:migrate
```

### Step 4: Start Service

```bash
# Development
npm run dev

# Production
npm start
```

**Expected Output:**

```
Auth Service is running on http://localhost:3002
```

---

## Configuration

### Environment Variables

```bash
# Server
PORT=3002
NODE_ENV=development

# JWT (IMPORTANT: Generate a strong random secret)
JWT_SECRET=<your-generated-secret-key>
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
```

### Database Configuration

File: `src/config/config.json`

```json
{
  "development": {
    "username": "<your-db-username>",
    "password": "<your-db-password>",
    "database": "Flights",
    "host": "localhost",
    "dialect": "mysql"
  }
}
```

⚠️ **Security Note:** Never commit actual database credentials. Use environment variables and add `.env` to `.gitignore`

---

## API Endpoints

### Base URL

```
http://localhost:3002/api/v1/auth
```

### 1. Register User

```http
POST /register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "User",
  "lastName": "Name",
  "phoneNumber": "+1000000000"
}
```

**Response:** 201 Created

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "User",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 2. Login User

```http
POST /login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "data": {
    "user": {...},
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 3. Verify Token (Inter-Service)

```http
POST /verify-token
Content-Type: application/json

{
  "token": "eyJhbGc..."
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 4. Refresh Token

```http
POST /refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:** 200 OK

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### 5. Get User Info

```http
GET /user/:userId
Authorization: Bearer <accessToken>
```

**Response:** 200 OK

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "User",
    "lastName": "Name",
    "role": "user",
    "isActive": true
  }
}
```

### 6. Update User Role (Admin Only)

```http
PUT /user/:userId/role
Authorization: Bearer <adminToken>
Content-Type: application/json

{
  "role": "admin"
}
```

### 7. Deactivate User (Admin Only)

```http
PUT /user/:userId/deactivate
Authorization: Bearer <adminToken>
```

### 8. Activate User (Admin Only)

```http
PUT /user/:userId/activate
Authorization: Bearer <adminToken>
```

---

## Usage Examples

### Register & Get Token

```bash
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Pass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+1234567890"
  }'
```

### Use Token in Requests

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp9..."

# Get user info
curl http://localhost:3002/api/v1/auth/user/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Verify Token (Other Services)

```bash
curl -X POST http://localhost:3002/api/v1/auth/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "eyJhbGc..."}'
```

---

## Authentication Flow

```
Register → Hash Password → Create User → Generate Tokens → Return Response

Login → Verify Email → Check Password → Generate Tokens → Return Response

Protected Request → Extract Token → Verify Signature → Check Expiry → Continue
```

---

## Integration Guide

### Flight System Integration

```javascript
// src/middlewares/auth-middleware.js
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const response = await axios.post('http://localhost:3002/api/v1/auth/verify-token', { token });
  req.user = response.data.data;
  next();
};
```

### Booking Service Integration

Same pattern as Flight System above.

---

## Testing

### Health Check

```bash
curl http://localhost:3002/health
```

### Register Test

```bash
curl -X POST http://localhost:3002/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "+1111111111"
  }'
```

### Protected Endpoint Test

```bash
# Extract token from register response
TOKEN="..."

# Test with valid token
curl http://localhost:3002/api/v1/auth/user/1 \
  -H "Authorization: Bearer $TOKEN"
# Expected: 200 OK

# Test without token
curl http://localhost:3002/api/v1/auth/user/1
# Expected: 401 Unauthorized
```

---

## Troubleshooting

### Database Connection Error

```bash
# Verify MySQL is running
mysql -u <your-username> -p -e "SELECT 1;"

# Verify database exists
mysql -u <your-username> -p -e "SHOW DATABASES;"

# Check credentials in config.json
cat src/config/config.json
```

### Port Already in Use

```bash
# Find process on port 3002
lsof -i :3002

# Kill process
kill -9 <PID>
```

### Token Verification Fails

```bash
# Ensure JWT_SECRET is correct
grep JWT_SECRET .env

# Check token expiry
# Tokens expire after configured time
```

### Password Hashing Fails

```bash
# Reinstall bcryptjs
npm install bcryptjs

# Verify installation
npm list bcryptjs
```

---

## Security Best Practices

✅ Passwords hashed with bcryptjs (10 rounds)  
✅ JWT tokens signed with secret key  
✅ Access tokens expire in 7 days  
✅ Email unique constraint  
✅ Role-based access control  
✅ Account activation flags  
✅ Admin-only sensitive operations

---

## Performance Notes

- Email indexed for fast lookups
- Role indexed for RBAC queries
- JWT payload contains user data (no extra queries)
- Token refresh only when needed

---

## See Also

- [Main Project README](../README.md)
- [Flight System](../flight-booking-system/README.md)
- [Booking Service](../flight-booking-service/README.md)

---

**Last Updated:** January 21, 2026  
**Version:** 1.0.0  
**Status:** Production Ready ✅
