# 🚀 Node-Fastify TypeScript Migration

A robust, production-ready Fastify API and MongoDB application, now fully migrated to **TypeScript** for enhanced type safety and maintainability.

## ✨ Core Features

- **🚀 Fastify (v5+)**: High-performance web framework.
- **🛡️ Secure Auth**: JWT-based authentication with Access & Refresh tokens.
- **🔑 RBAC**: Role-based access control (Admin vs. User).
- **⚡ Redis Caching**: Fast response times with ioredis.
- **🌱 MongoDB/Mongoose**: Schema-based data modeling with strict TypeScript interfaces.
- **🔍 Sanitization & Security**: Seamless CSRF, Helmet, and XSS protection.
- **📄 API Docs**: Auto-generated Swagger documentation.
- **🧪 Modern Tooling**: ESLint (v9+ Flat Config) and Prettier for code quality.

## 🛠️ TypeScript Architecture

The project has been fully migrated to TypeScript using **NodeNext** resolution for ESM compatibility:
- **Strict Typing**: All models, services, and controllers use TS interfaces.
- **Type Providers**: Fastify routes utilize type providers for compile-time schema validation.
- **Declaration Merging**: Extended Fastify types for `jwt`, `redis`, and authenticated `user` objects.

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file from the example:
```bash
cp .env.example .env
```

### 3. Run in Development
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
npm start
```

## 📜 Scripts

- `npm run dev`: Runs the app using `tsx watch` for instant feedback.
- `npm run build`: Compiles TS to JS in the `dist/` directory.
- `npm run lint`: Runs ESLint on the entire project with auto-fix.

---
*Created by Ansh*
