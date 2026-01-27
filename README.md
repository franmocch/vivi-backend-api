# User Microservice Backend API

Backend API built with **Node.js**, **Express** and **MongoDB** for user management, authentication and authorization.

This project is intended as a learning and portfolio project, following real-world backend practices.

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

Create a `config.env` file in the root directory based on the example file:

```bash
cp config.env.example config.env
```

Fill in the required values:

- MongoDB connection string
- JWT secret
- JWT expiration
- Email credentials (Mailtrap recommended for development)

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

http://localhost:3000/api-docs

---

## 📌 Project Status

Work in progress.

Planned improvements:

- Automated tests
- CI pipeline
