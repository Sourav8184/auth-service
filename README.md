# Auth Service - Centralized Authentication & Authorization

A dedicated microservice for handling authentication and authorization across the entire flight management system.

## Features

- **User Registration** - Create new user accounts
- **User Login** - Authenticate users with JWT tokens
- **Token Management** - Generate and refresh JWT tokens
- **Role-Based Access Control** - Support for user, admin, and moderator roles
- **User Management** - Activate/deactivate users and manage roles
- **Token Verification** - Verify tokens for other microservices
- **Access Validation** - Check user permissions across the system

## Architecture

This service serves as the centralized authentication hub for all microservices:

```
Flight-Booking-System
        ↓ calls → [Auth Service]
Flight-Booking-Service
        ↓ calls → [Auth Service]
etc...
```

## Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables in `.env`:

```
PORT=
NODE_ENV=
JWT_SECRET=
JWT_EXPIRY=
REFRESH_TOKEN_EXPIRY=

```

3. Run database migrations:

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

## API Endpoints

### Public Routes

#### Register

```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "1234567890"
}
```

#### Login

```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token

```
POST /api/v1/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protected Routes (Microservice Communication)

#### Verify Token

```
POST /api/v1/auth/verify-token
Authorization: Bearer <access_token>

{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### Validate Access

```
POST /api/v1/auth/validate-access
Authorization: Bearer <access_token>

{
  "userId": "user-id",
  "requiredRole": "admin"
}
```

### Authenticated Routes

#### Get User Info

```
GET /api/v1/auth/user/:userId
Authorization: Bearer <access_token>
```

### Admin Routes

#### Update User Role

```
PUT /api/v1/auth/user/:userId/role
Authorization: Bearer <access_token>

{
  "newRole": "admin"
}
```

#### Deactivate User

```
PUT /api/v1/auth/user/:userId/deactivate
Authorization: Bearer <access_token>
```

#### Activate User

```
PUT /api/v1/auth/user/:userId/activate
Authorization: Bearer <access_token>
```

## Integration with Other Services

Other microservices should use this auth service for:

1. **Token Verification** - Call `/api/v1/auth/verify-token` to validate user tokens
2. **Access Validation** - Call `/api/v1/auth/validate-access` to check user permissions
3. **User Information** - Call `/api/v1/auth/user/:userId` to get user details

## Role Hierarchy

- **Admin** (High Level) - Full access, can manage users
- **User** (Low Level) - Basic user access

## Security

- Passwords are hashed using bcryptjs (10 salt rounds)
- JWT tokens are signed with a secret key
- Tokens have expiration times
- Soft deletion of users via `isActive` flag
- Role-based access control on sensitive endpoints

## Development

Start the development server:

```bash
npm run dev
```

The server will:

- Sync database schema
- Listen on port XXXX
- Log all requests and errors
