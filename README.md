# 🚀 Premium Fastify TypeScript API Engine

A production-grade, high-performance API architecture built with **Node.js**, **Fastify**, and **TypeScript**. This engine is designed for high scalability, security-first operations, and an elite developer experience.

## ✨ Key Features

- **Schema-First API Documentation**: Automated OpenAPI 3.0 specs using `@fastify/swagger`.
- **Premium Swagger UI**: Customized dark-themed interface with hidden search bars and protected access.
- **Auto-Seeding**: Self-healing database that automatically seeds default Admin and System Content (Terms, FAQ, Privacy) on startup.
- **AWS Secrets Manager**: Enterprise-grade secret orchestration for production environments.
- **Multi-Layer Security**: JWT (Access/Refresh), HMAC Signatures, API Keys, and RBAC middleware.
- **Real-time Performance**: Redis-backed session management and rate limiting.

## 🏗️ Architecture Overview

The system follows a strict **Modular Layered Architecture** to ensure clean separation of concerns:

- **Schema Layer (`.schema.ts`)**: Centralized source of truth for Request Validation and Swagger Documentation.
- **Route Layer**: Fastify routes with strict type-safety and multi-layer security hooks.
- **Controller Layer**: Orchestrates business logic and response formatting.
- **Service Layer**: Pure business logic, independent of transport protocols.
- **Repository Layer**: Optimized Mongoose access with advanced indexing and `.lean()` performance.

## 🛡️ Security Configuration

The engine supports both `.env` and **AWS Secrets Manager**.

### AWS Secrets Mapping
If using AWS, the following keys are mapped automatically:
| Secret Key | Mapping | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `MONGODB_URI` | Connection string for MongoDB |
| `REDIS_HOST` | `REDIS_HOST` | Redis endpoint |
| `API_KEY` | `API_KEY_SECRET` | Client-side API Key |
| `SWAGGER_USER` | `DOCS_AUTH.username` | Basic Auth for Swagger UI |
| `SWAGGER_PASSWORD` | `DOCS_AUTH.password` | Basic Auth for Swagger UI |
| `JWT_SECRET` | `JWT_SECRET` | Signing key for tokens |
| `SIGNATURE_SECRET` | `SIGNATURE_SECRET` | HMAC Signature secret |

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env
```

### 3. Running the API
```bash
# Development (with tsx watch)
npm run dev

# Production Build
npm run build
npm start
```

## 📖 API Documentation

The interactive Swagger documentation is available at:
👉 `http://localhost:3333/swagger`

*Note: Access is protected by Basic Auth as configured in your AWS Secrets.*

### Core Modules

| Module | Base Path | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/v1/auth` | User/Admin authentication & profile |
| **Admin** | `/api/v1/admin` | User management & administrative controls |
| **Common** | `/api/v1/common` | System content (Terms, Privacy, FAQ) |
| **Health** | `/api/v1/health` | System status & infrastructure checks |

## 📂 Project Structure

```text
src/
├── config/         # Env & AWS Secrets orchestration
├── core/           # Security middlewares (Auth, HMAC, RBAC)
├── db/             # Mongoose Models & Connection logic
├── modules/        # Feature Modules (Auth, Admin, Users)
│   ├── [module]/
│   │   ├── [name].controller.ts
│   │   ├── [name].route.ts
│   │   └── [name].schema.ts   <-- Validation & Docs
├── plugins/        # Fastify Plugins (JWT, Redis, Swagger, Seeder)
├── utils/          # Shared Utilities (Response, Crypto, Seeder)
└── server.ts       # Application Entry Point
```

---
*Maintained with excellence by Ansh*
