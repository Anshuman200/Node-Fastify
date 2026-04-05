import fp from "fastify-plugin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default fp(async (app, opts) => {
    const projectName = opts.projectName || "API Documentation";
    
    let logoData = "";
    try {
        const logoPath = path.join(__dirname, "../../public/assets/logo.png");
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoData = `data:image/png;base64,${logoBuffer.toString('base64')}`;
        }
    } catch (e) {}

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>404 - Not Found | ${projectName}</title>
        <style>
            :root { --primary: #6366f1; --bg: #0b0e14; --card-bg: rgba(23, 27, 39, 0.8); --text: #f8fafc; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', sans-serif; background: #0b0e14; color: var(--text); height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { text-align: center; padding: 4rem 2rem; background: var(--card-bg); backdrop-filter: blur(16px); border-radius: 2.5rem; border: 1px solid rgba(255,255,255,0.08); max-width: 480px; width: 90%; }
            .logo { width: 80px; height: 80px; margin-bottom: 2rem; border-radius: 1.2rem; }
            h1 { font-size: 8rem; font-weight: 800; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; line-height: 1; }
            .subtitle { font-size: 1.5rem; font-weight: 700; margin: 1.5rem 0; color: #f1f5f9; }
            .btn { display: inline-block; padding: 1rem 2rem; border-radius: 1rem; background: var(--primary); color: white; text-decoration: none; font-weight: 700; }
        </style>
    </head>
    <body>
        <div class="container">
            ${logoData ? `<img src="${logoData}" alt="Logo" class="logo">` : ''}
            <h1>404</h1>
            <p class="subtitle">Oops! Page Missing</p>
            <a href="/" class="btn">Return to Home</a>
        </div>
    </body>
    </html>
    `;

    app.setNotFoundHandler((request, reply) => {
        reply.code(404).type('text/html').send(html);
    });

}, { name: 'not-found-handler' });
