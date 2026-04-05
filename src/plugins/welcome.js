import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async (app, opts) => {
    const projectName = opts.projectName || "API Documentation";
    
    // Read logo locally and convert to base64 for embedding
    let logoData = "";
    try {
        const logoPath = path.join(__dirname, "../../public/assets/logo.png");
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
    } catch (e) {
        console.error("Welcome Plugin: Failed to read local logo:", e.message);
    }

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome | ${projectName}</title>
        <style>
            :root {
                --primary: #6366f1;
                --bg: #0b0e14;
                --card-bg: rgba(23, 27, 39, 0.8);
                --text: #f8fafc;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                font-family: 'Inter', -apple-system, sans-serif;
                background: linear-gradient(135deg, #0b0e14 0%, #151821 100%);
                color: var(--text);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }

            .container {
                position: relative;
                z-index: 10;
                text-align: center;
                padding: 4rem 2rem;
                background: var(--card-bg);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 2.5rem;
                box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.7);
                max-width: 520px;
                width: 90%;
            }

            .logo {
                width: 100px;
                height: 100px;
                margin-bottom: 2rem;
                border-radius: 1.5rem;
                box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
            }

            h1 {
                font-size: 3rem;
                font-weight: 800;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                line-height: 1.2;
            }

            .subtitle {
                font-size: 1.25rem;
                font-weight: 500;
                color: #94a3b8;
                margin-bottom: 3rem;
                line-height: 1.6;
            }

            .btn {
                display: inline-block;
                padding: 1.2rem 3rem;
                border-radius: 1.25rem;
                font-weight: 700;
                text-decoration: none;
                transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-size: 1.1rem;
                background: var(--primary);
                color: white;
                box-shadow: 0 15px 30px -5px rgba(99, 102, 241, 0.5);
            }

            .btn:hover {
                transform: translateY(-5px) scale(1.05);
                box-shadow: 0 25px 40px -10px rgba(99, 102, 241, 0.7);
            }

            .btn span { margin-left: 10px; }

            .badge {
                display: inline-block;
                padding: 0.5rem 1rem;
                background: rgba(99, 102, 241, 0.1);
                color: #818cf8;
                border-radius: 2rem;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 1.5rem;
                border: 1px solid rgba(99, 102, 241, 0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="badge">V1 - Development Mode</div>
            ${logoData ? `<img src="${logoData}" alt="Project Logo" class="logo">` : ''}
            <h1>Authentication & User Management</h1>
            <p class="subtitle">Securely manage your users, handle authentication streams, and explore API endpoints with ease.</p>
            
            <a href="/swagger" class="btn">Explore API Docs <span>→</span></a>
        </div>
    </body>
    </html>
    `;

    // Root route protected by Basic Auth
    app.route({
        method: 'GET',
        url: '/',
        schema: { hide: true },
        onRequest: (request, reply, done) => {
            app.basicAuth(request, reply, (err) => {
                if (err) {
                    reply.code(401).header('WWW-Authenticate', 'Basic realm="API Documentation"').send('Unauthorized access.');
                } else {
                    done();
                }
            });
        },
        handler: (request, reply) => {
            reply.type('text/html').send(html);
        }
    });

}, { name: 'welcome-plugin', dependencies: ['swagger-auth'] });
