# User Microservice Backend API

Backend API built with **Node.js**, **Express** and **MongoDB** that provides a complete user management and authentication system.

The API is designed as a reusable microservice that can be integrated into different applications, handling user registration, authentication, authorization and security concerns in a centralized way.

---

## 🚀 Features

- User registration and login
- Authentication with JWT
- Protected routes
- Role-based access control
- Secure cookies
- Rate limiting
- Input sanitization (NoSQL injection & XSS)
- Centralized error handling
- Swagger / OpenAPI documentation
- Configurable CORS support

---

## 🛠 Tech Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT (JSON Web Tokens)
- ESLint & Prettier

---

## 📦 How to Download and Run the Backend

This project is a standalone backend application.

### 1️⃣ Download the project

Clone the repository:

```bash
git clone https://github.com/franmocch/vivi-backend-api.git
cd vivi-backend-api
```

---

### 2️⃣ Install dependencies

Make sure you have **Node.js (v18 or higher)** installed.

```bash
npm install
```

---

### 3️⃣ Environment variables

Create a `config.env` file inside `src/config/` based on the example file:

```bash
cp src/config/config.env.example src/config/config.env
```

Fill in the required values:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=your_mongo_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d

CORS_ORIGINS=http://localhost:5173
```

The server reads environment variables from:

```
src/config/config.env
```

---

### 4️⃣ Run the backend server

```bash
npm run dev
```

The server will start on:

```
http://localhost:3000
```

---

### 5️⃣ Verify the backend is running

You can test the API using:

- Swagger UI  
  http://localhost:3000/api-docs
- API clients like Postman, Insomnia or Thunder Client
- A frontend application consuming the API

---

## 🌐 CORS Configuration

CORS is configured via environment variables.

Allowed origins are defined using:

```env
CORS_ORIGINS=http://localhost:5173,https://your-frontend.com
```

This allows the backend to support multiple frontends without code changes.

---

## 🔐 Authentication

Authentication is handled using **JWT**.

After login, include the token in the request headers:

```
Authorization: Bearer <your_token_here>
```

Some routes are protected and require authentication and/or specific roles.

---

## 📡 API Endpoints (Main)

### Auth

| Method | Endpoint                           | Description                 |
| -----: | ---------------------------------- | --------------------------- |
|   POST | /api/v1/auth/signup                | Register new user           |
|   POST | /api/v1/auth/login                 | Login user                  |
|   POST | /api/v1/auth/forgot-password       | Request password reset      |
|  PATCH | /api/v1/auth/reset-password/:token | Reset password              |
|  PATCH | /api/v1/auth/update-password       | Update password (logged in) |

---

### Users (Authenticated)

| Method | Endpoint         | Description              |
| -----: | ---------------- | ------------------------ |
|    GET | /api/v1/users/me | Get current user profile |
|  PATCH | /api/v1/users/me | Update current user      |
| DELETE | /api/v1/users/me | Deactivate current user  |

---

### Users (Admin)

| Method | Endpoint          | Description     |
| -----: | ----------------- | --------------- |
|    GET | /api/v1/users     | Get all users   |
|   POST | /api/v1/users     | Create new user |
|    GET | /api/v1/users/:id | Get user by ID  |
|  PATCH | /api/v1/users/:id | Update user     |
| DELETE | /api/v1/users/:id | Delete user     |

> Admin routes are restricted to users with `admin` or `superadmin` roles.

---

## 📚 API Documentation

Swagger UI available at:

- Local: http://localhost:3000/api-docs
- Production: https://vivi-backend-api.onrender.com/api-docs

Swagger UI is protected via Basic Auth in production.

---

## 📁 Project Structure

```txt
src/
 ├─ config/        # Application and server configuration (env, CORS, Swagger , database connection)
 ├─ docs/          # API documentation and OpenAPI specifications
 ├─ security/      # Security-related middleware (rate limiting, sanitization, protections)
 ├─ controllers/   # Request handlers containing business logic
 ├─ routes/        # API route definitions and endpoint mapping
 ├─ models/        # Database schemas and data models (Mongoose)
 ├─ utils/         # Shared utility functions and helpers
 └─ app.js         # Express application initialization and middleware setup
```

---z

## 📌 Project Status

Work in progress.

Planned improvements:

- Automated tests
- CI pipeline
