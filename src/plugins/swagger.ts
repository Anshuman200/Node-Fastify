import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";

export default fp(async function swaggerPlugin(app: FastifyInstance) {
    await app.register(swagger, {
        openapi: {
            info: {
                title: "Learn Fastify API",
                description: "A secure and robust Fastify API with JWT and Redis",
                version: "1.0.0",
            },
            tags: [
                { name: "User Auth", description: "Customer Authentication & Profile" },
                { name: "Admin Auth", description: "Internal Administrative Access" },
                { name: "Admin Users", description: "User Management for Admins" },
                { name: "DB Health", description: "System Status & Health Checks" }
            ],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: "http",
                        scheme: "bearer",
                        bearerFormat: "JWT",
                    },
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
            favicon: [
                {
                    filename: "favicon.ico",
                    rel: "icon",
                    sizes: "16x16",
                    type: "image/x-icon",
                    content: "/public/favicon.ico"
                }
            ],
            css: [
                {
                    filename: "theme.css",
                    content: `
                        /* Premium Dark Theme for Swagger UI */
                        .swagger-ui { background-color: #0f172a; color: #f8fafc; font-family: 'Inter', sans-serif; }
                        .swagger-ui .topbar { background-color: #090e1b; border-bottom: 2px solid #4f46e5; height: 60px; display: flex; align-items: center; }
                        .swagger-ui .topbar-wrapper .link img { content: url('/public/logo.png'); height: 35px; width: auto; margin-right: 12px; }
                        .swagger-ui .info .title, .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .info td, .swagger-ui .info h1, .swagger-ui .info h2, .swagger-ui .info h3, .swagger-ui .info h4, .swagger-ui .info h5 { color: #f8fafc !important; }
                        .swagger-ui .scheme-container { background: #1e293b; box-shadow: none; border-bottom: 1px solid rgba(255,255,255,0.05); }
                        .swagger-ui section.models { border: 1px solid rgba(255,255,255,0.05); }
                        .swagger-ui section.models.is-open { padding: 10px; background: #1e293b; }
                        .swagger-ui .opblock-tag { border-bottom: 1px solid rgba(255,255,255,0.1); color: #f8fafc; }
                        .swagger-ui .opblock .opblock-summary-path { color: #f8fafc; font-weight: 600; }
                        .swagger-ui .opblock .opblock-summary-description { color: #94a3b8; }
                        .swagger-ui .opblock.opblock-post { background: rgba(16, 185, 129, 0.05); border-color: #10b981; }
                        .swagger-ui .opblock.opblock-get { background: rgba(59, 130, 246, 0.05); border-color: #3b82f6; }
                        .swagger-ui .opblock.opblock-put { background: rgba(245, 158, 11, 0.05); border-color: #f59e0b; }
                        .swagger-ui .opblock.opblock-delete { background: rgba(239, 68, 68, 0.05); border-color: #ef4444; }
                        .swagger-ui select { background: #334155; color: #f8fafc; border: 1px solid #475569; }
                        .swagger-ui .download-contents, .swagger-ui .copy-to-clipboard { background: #334155; color: #f8fafc; }
                        .swagger-ui .btn.authorize { color: #10b981; border-color: #10b981; }
                        .swagger-ui .btn.authorize svg { fill: #10b981; }
                        .swagger-ui .model-box { background: #0f172a; }
                        .swagger-ui .model { color: #f8fafc; }
                        .swagger-ui .prop-type { color: #6366f1; }
                        .swagger-ui .prop-format { color: #94a3b8; }
                        /* Icon Visibility Fixes */
                        .authorization__btn svg { fill: #f8fafc !important; opacity: 1 !important; }
                        .opblock-control-arrow svg { fill: #f8fafc !important; opacity: 1 !important; }
                        .opblock-summary-control svg { fill: #f8fafc !important; opacity: 1 !important; }
                        .expand-methods svg, .expand-operation svg { fill: #f8fafc !important; opacity: 1 !important; }
                        .view-line-link.copy-to-clipboard svg { fill: #f8fafc !important; opacity: 1 !important; }
                    `
                }
            ]
        },
        staticCSP: true,
        transformStaticCSP: (header) => header,
    });
}, { name: "swagger-plugin", dependencies: ["basic-auth-plugin"] });