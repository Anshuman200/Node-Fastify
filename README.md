# 🚀 Node-Fastify Advanced Auth System

[![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://www.fastify.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=json-web-tokens&logoColor=white)](https://jwt.io/)

A production-ready, highly secure authentication and user management system built with **Fastify**, **MongoDB**, and **Redis**. This project implements modern security standards and a unique **userName-first** architecture similar to Instagram.

---

## ✨ Key Features

- **🔐 Multi-Role RBAC**: Strict separation between Admin, Sub-Admin, and User roles using dedicated middleware guards.
- **🆔 Identity Architecture**: Uses `userName` as the primary identifier across the system, stripping internal MongoDB IDs from all public API responses.
- **🛡️ Advanced Security**:
  - **Seamless CSRF**: Automatic token generation and delivery via response headers (no extra API calls required).
  - **Refresh Token Rotation**: Secure session management using Redis for high-performance session tracking.
  - **Rate Limiting**: Protection against brute-force attacks on sensitive auth endpoints.
  - **Global Sanitization**: Automatic stripping of passwords, OTPs, and internal fields from all outgoing data.
- **📧 Lifecycle Management**: Full support for email verification (OTP), password recovery, and account status management (`active`, `deactivate`, `delete`).
- **⚡ Performance**: Built on Fastify for low overhead and Redis for lightning-fast caching and session management.

---

## 🛠️ Tech Stack

- **Framework**: Fastify (ESM)
- **Database**: MongoDB (Mongoose)
- **Session/Cache**: Redis (ioredis)
- **Authentication**: fastify-jwt
- **Security**: @fastify/helmet, @fastify/cors, @fastify/csrf-protection, @fastify/rate-limit
- **Documentation**: Swagger/OpenAPI 3.0

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/try/download/community)
- [Redis](https://redis.io/download)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Node-Fastify
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   PORT=3333
   MONGO_URI=mongodb://localhost:27017/your_db
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_super_secret_jwt_key
   COOKIE_SECRET=your_super_secret_cookie_key
   ```
4. **Seed the Database**
   Initialize the default SuperAdmin:

   ```bash
   npm run seed
   ```
5. **Start Development Server**

   ```bash
   npm run dev
   ```

---

## 📖 API Documentation

Once the server is running, visit the interactive Swagger documentation at:

👉 `http://localhost:3333/api/v1/documentation`

### Core Endpoints

| Category          | Endpoint                | Method   | Description                |
| :---------------- | :---------------------- | :------- | :------------------------- |
| **Auth**    | `/api/v1/user/signup` | `POST` | Create a new user account  |
| **Auth**    | `/api/v1/user/login`  | `POST` | Standard user login        |
| **Profile** | `/api/v1/user/me`     | `GET`  | Get current user's profile |
| **Admin**   | `/api/v1/admin/login` | `POST` | Administrative login       |
| **Admin**   | `/api/v1/admin/me`    | `GET`  | Get admin profile details  |

---

## 🛡️ Security Best Practices

This project implements:

- **`userName`-only exposures**: Internal `_id` is never leaked to the frontend.
- **`httpOnly` Cookies**: Prevents XSS attacks from reading sensitive tokens.
- **Request Validation**: Strict Joi/Ajv schemas for all incoming payloads.
- **Graceful Shutdown**: Handles process signals to close DB/Redis connections cleanly.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Made with ❤️ by Ansh for high-performance Node.js applications.
</p>
