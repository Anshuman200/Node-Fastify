# 🚀 High-Performance Fastify TypeScript Backend

A production-grade, highly scalable API architecture built with Node.js, Fastify, and TypeScript. This backend is engineered for performance, security-first operations, and clean modular maintainability.

## 🏗️ Architecture Overview

The system follows a strict **Layered Architecture** pattern to ensure separation of concerns and testability:

- **Entry Layer (`server.ts`)**: Handles process lifecycle, graceful shutdowns, and global error handling.
- **Bootstrap Layer (`bootstrap.ts`)**: Manages plugin orchestration and dependency injection order.
- **Route Layer**: Fastify route definitions with strict JSON Schema validation.
- **Controller Layer**: Orchestrates requests and maps them to business services.
- **Service Layer**: Contains core business logic, independent of transport protocols.
- **Repository Layer**: Optimized database access using Mongoose with `.lean()` and advanced aggregations.

## 🛡️ Security Suite (Production Ready)

- **Multi-Layer Authentication**: 
    - **API Key Verification**: Timing-safe client identification.
    - **HMAC Request Signatures**: SHA256 integrity checks with stable payload normalization.
    - **JWT (Access/Refresh Tokens)**: Secure token lifecycle with Redis-backed session control.
    - **RBAC**: Granular Role-Based Access Control middleware.
- **Replay Protection**: Nonce-based protection using Redis to prevent intercepted request re-execution.
- **Infrastructure Security**: CSRF protection, Helmet (HSTS, CSP), XSS sanitization, and rate-limiting.
- **AWS Secrets Manager**: Integrated secret loading for production environments.

## ⚡ Performance Optimizations

- **Connection Pooling**: Advanced MongoDB connection management with `minPoolSize` and `maxPoolSize` control.
- **Cache-Aside Pattern**: Redis caching utility for high-frequency data access.
- **Database Efficiency**: Strict indexing on critical fields and optimized `.lean()` queries for read-heavy operations.
- **Compression**: Gzip/Brotli support for reduced payload transfer times.

## 🛠️ Technology Stack

- **Runtime**: Node.js (v20+)
- **Framework**: Fastify (v5+)
- **Language**: TypeScript (ESM / NodeNext)
- **Database**: MongoDB (Mongoose)
- **Caching**: Redis (ioredis)
- **Email**: Resend
- **Documentation**: Swagger / OpenAPI

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
The app supports both `.env` and **AWS Secrets Manager**.
```bash
cp .env.example .env
```

### 3. Development
```bash
npm run dev
```

### 4. Production Build
```bash
npm run build
npm start
```

## 🛣️ Core API Endpoints

### Auth Module (`/api/v1/auth`)
- `POST /login`: Authenticate and receive tokens.
- `GET /profile`: Get current user/admin profile details.
- `POST /logout`: Revoke tokens and end session.

### Admin Module (`/api/v1/admin`)
- `GET /profile`: Admin-specific profile view.
- `GET /users`: Paginated user management (Admin only).

## 📂 Project Structure

```text
src/
├── config/         # Environment & AWS Secrets config
├── core/           # Middlewares (Auth, Signature, RBAC)
├── db/             # Models & Connection management
├── modules/        # Feature modules (Auth, Admin, Users)
│   ├── [module]/
│   │   ├── [name].controller.ts
│   │   ├── [name].service.ts
│   │   ├── [name].repository.ts
│   │   ├── [name].route.ts
│   │   └── [name].schema.ts
├── plugins/        # Fastify plugins (Redis, JWT, DB)
├── utils/          # Shared utilities (Cache, Crypto, Response)
└── server.ts       # Application entry point
```

---
*Maintained by Ansh*
