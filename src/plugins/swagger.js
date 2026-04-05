import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyBasicAuth from "@fastify/basic-auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async (app, opts) => {
    const projectName = opts.projectName || "API DOC";

    // ✅ Load logo
    let logoBuffer = null;
    try {
        const logoPath = path.join(__dirname, "../../public/assets/logo.png");
        if (fs.existsSync(logoPath)) {
            logoBuffer = fs.readFileSync(logoPath);
        }
    } catch (e) { }

    // ✅ Basic Auth
    await app.register(fastifyBasicAuth, {
        validate: async (username, password) => {
            if (
                username !== process.env.SWAGGER_USER ||
                password !== process.env.SWAGGER_PASSWORD
            ) {
                throw new Error("Unauthorized");
            }
        },
        authenticate: true,
    });

    // ✅ Swagger config
    await app.register(fastifySwagger, {
        openapi: {
            info: {
                title: projectName,
                description: "Production-ready API docs",
                version: "1.0.0",
            },
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

    // ✅ Swagger UI
    await app.register(fastifySwaggerUi, {
        routePrefix: "/swagger",

        uiHooks: {
            onRequest: (req, reply, next) => {
                app.basicAuth(req, reply, next);
            },
        },

        uiConfig: {
            docExpansion: "list",
            deepLinking: false,
            filter: true,
            tryItOutEnabled: true,
        },

        // ✅ 🔥 CSS FIXES
        customCss: `
      html, body {
        background: #0b111e !important;
      }

      .swagger-ui {
        background-color: #0b111e !important;
        color: #e2e8f0 !important;
      }

      /* Topbar */
      .swagger-ui .topbar {
        background-color: #0f172a !important;
        border-bottom: 1px solid rgba(255,255,255,0.1);
      }

      /* 🚫 REMOVE EXPLORE BAR COMPLETELY */
      .swagger-ui .topbar .download-url-wrapper {
        display: none !important;
      }

      /* Cards */
      .swagger-ui .opblock,
      .swagger-ui .model-box,
      .swagger-ui .info,
      .swagger-ui .scheme-container {
        background-color: #0b111e !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
      }

      /* Text */
      .swagger-ui .info .title,
      .swagger-ui .opblock-summary-path {
        color: #fff !important;
      }

      /* Inputs */
      .swagger-ui input,
      .swagger-ui textarea,
      .swagger-ui select {
        background: rgba(255,255,255,0.05) !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 6px !important;
      }

      /* Buttons */
      .swagger-ui .btn.authorize {
        color: #6366f1 !important;
        border-color: #6366f1 !important;
        background: rgba(99,102,241,0.1) !important;
      }

      /* Code */
      .swagger-ui .microlight {
        background: #000 !important;
        color: #fff !important;
        border-radius: 8px;
        padding: 12px;
      }
    `,

        // ✅ 🔥 REAL SEARCH (CASE-INSENSITIVE + ENDPOINT SEARCH)
        customJs: `
      window.addEventListener('load', () => {
        setTimeout(() => {
          const input = document.querySelector('.wrapper .filter input');

          if (!input) return;

          input.placeholder = 'Search APIs (path, method, tags...)';
          input.focus();

          input.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();

            const blocks = document.querySelectorAll('.opblock');

            blocks.forEach(block => {
              const text = block.innerText.toLowerCase();

              if (text.includes(value)) {
                block.style.display = '';
              } else {
                block.style.display = 'none';
              }
            });
          });
        }, 800);
      });
    `,

        staticCSP:
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; img-src 'self' data:;",

        transformSpecificationClone: true,

        ...(logoBuffer && {
            logo: {
                type: "image/png",
                content: logoBuffer,
                href: "/swagger",
            },
        }),
    });
}, { name: "swagger-auth" });