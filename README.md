# Vivi Backend API

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

## ⚙️ Setup & Installation

### 1️⃣ Clone the repository

```bash
git clone https://github.com/franmocch/vivi-backend-api.git
cd vivi-backend-api
```

---

### 2️⃣ Install dependencies

```bash
npm install
```

---

### 3️⃣ Environment variables

Create a `config.env` file in the root directory based on the example file:

```bash
cp config.env.example config.env
```

Fill in your own values:

- MongoDB connection string
- JWT secret
- Email credentials (Mailtrap recommended for development)

---

### 4️⃣ Run the project

```bash
npm run dev
```

The server will start on:

```
http://localhost:3000
```

---

## 🔐 Authentication

Authentication is handled using **JWT**.

After login, include the token in the request headers:

```
Authorization: Bearer <your_token_here>
```

Some routes are protected and require authentication and/or specific roles.

---

## 📡 API Endpoints (main)

### Auth

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | /api/v1/users/signup | Register new user |
| POST   | /api/v1/users/login  | Login user        |

---

### Users

| Method | Endpoint               | Description              |
| ------ | ---------------------- | ------------------------ |
| GET    | /api/v1/users/me       | Get current user profile |
| PATCH  | /api/v1/users/updateMe | Update current user      |
| DELETE | /api/v1/users/deleteMe | Deactivate user          |

> Some routes are restricted to admin roles.

---

## 🧪 Development Notes

This project follows a layered architecture:

- routes
- controllers
- models
- utils

Configuration is handled via environment variables.

Experimental or local-only files are intentionally excluded from the repository.

---

## 📚 API Documentation

Swagger UI available at:

http://localhost:3000/api-docs

## 📌 Project Status

Work in progress.

Planned improvements:

- Automated tests
- CI pipeline
