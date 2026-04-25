import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";
import { env } from "../config/env.js";

export default fp(async function swaggerPlugin(app: FastifyInstance) {
    await app.register(swagger, {
        openapi: {
            info: {
                title: "Learn Fastify API",
                description: "A secure and robust Fastify API with JWT, HMAC, and Redis",
                version: "1.0.0",
            },
            servers: [
                {
                    url: `http://localhost:${env.PORT}`,
                    description: "Local Development Server"
                }
            ],
            tags: [
                { name: "DB Health", description: "System Status & Health Checks" },
                { name: "User Auth", description: "Customer Authentication & Profile" },
                { name: "Admin Auth", description: "Internal Administrative Access" },
                { name: "Admin Users", description: "User Management for Admins" },
                { name: "Common", description: "Common Content (For User & Admin)" },
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                        description: "Enter JWT token in format: Bearer <token>"
                    },
                    apiKeyAuth: {
                        type: "apiKey",
                        name: "x-api-key",
                        in: "header",
                        description: "Client API Key"
                    },
                    signatureAuth: {
                        type: "apiKey",
                        name: "x-signature",
                        in: "header",
                        description: "HMAC SHA256 Signature"
                    },
                    timestampHeader: {
                        type: "apiKey",
                        name: "x-timestamp",
                        in: "header",
                        description: "Request Timestamp for Signature"
                    }
                },
            },
        },
    });

    await app.register(swaggerUi, {
        routePrefix: "/swagger",
        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
        },
        theme: {
            title: "Learn Fastify API - Docs",
            css: [
                {
                    filename: "theme.css",
                    content: `
                        /* 🌑 Default Swagger Dark Theme Integration */
                        .swagger-ui .topbar { 
                            background-color: #1b1b1b !important; 
                            border-bottom: 2px solid #3b82f6; 
                        }
                        
                        /* Hide Search & Switcher */
                        .swagger-ui .topbar .download-url-wrapper { display: none !important; }
                        .swagger-ui .topbar .dark-mode-toggle { display: none !important; }
                        
                        /* Logo */
                        .swagger-ui .topbar-wrapper .link img { 
                            content: url('/public/logo.png'); 
                            height: 35px; 
                        }

                        /* Enforce standard dark mode colors if browser doesn't auto-detect */
                        @media (prefers-color-scheme: light) {
                          .swagger-ui { filter: invert(88%) hue-rotate(180deg); }
                          .swagger-ui .opblock-summary-method { filter: invert(1) hue-rotate(180deg); }
                          .swagger-ui .topbar { filter: invert(1) hue-rotate(180deg); }
                        }
                    `
                }
            ]
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
    });
}, { name: "swagger-plugin", dependencies: ["basic-auth-plugin"] });