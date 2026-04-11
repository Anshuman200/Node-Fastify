import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

export default fp(async function welcomePlugin(app: FastifyInstance) {
    app.get("/", {
        schema: {
            hide: true,
            summary: "Welcome to the API",
            description: "Default welcome route",
        }
    }, async (request, reply) => {
        const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Fastify API | Welcome</title>
    <link rel="icon" type="image/x-icon" href="/public/favicon.ico">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.4);
            --bg: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --text: #f8fafc;
            --text-dim: #94a3b8;
            --accent: #22d3ee;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', sans-serif;
        }

        body {
            background-color: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
        }

        /* Ambient Background Glows */
        .glow {
            position: absolute;
            width: 50vw;
            height: 50vw;
            border-radius: 50%;
            background: radial-gradient(circle, var(--primary-glow) 0%, transparent 70%);
            filter: blur(80px);
            z-index: 0;
            opacity: 0.5;
        }

        .glow-1 { top: -20%; left: -10%; }
        .glow-2 { bottom: -20%; right: -10%; background: radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%); }

        .container {
            position: relative;
            z-index: 1;
            width: 90%;
            max-width: 800px;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 32px;
            padding: 4rem;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.8s ease-out;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .logo-container {
            margin-bottom: 2rem;
            display: inline-block;
            position: relative;
        }

        .logo-ring {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 120px;
            height: 120px;
            border: 2px solid var(--primary);
            border-radius: 50%;
            opacity: 0.3;
            animation: pulse 2s infinite ease-in-out;
        }

        @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.1; }
            100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #fff, #94a3b8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
            letter-spacing: -1px;
        }

        p {
            color: var(--text-dim);
            font-size: 1.25rem;
            line-height: 1.6;
            margin-bottom: 3rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        .actions {
            display: flex;
            gap: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
        }

        .btn {
            padding: 1rem 2rem;
            border-radius: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .btn-primary {
            background: var(--primary);
            color: white;
            box-shadow: 0 10px 15px -3px var(--primary-glow);
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            background: #4f46e5;
            box-shadow: 0 20px 25px -5px var(--primary-glow);
        }

        .btn-secondary {
            background: rgba(255, 255, 255, 0.05);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-2px);
        }

        .status-badge {
            margin-top: 3rem;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(34, 211, 238, 0.1);
            color: var(--accent);
            padding: 8px 16px;
            border-radius: 100px;
            font-size: 0.875rem;
            font-weight: 600;
            border: 1px solid rgba(34, 211, 238, 0.2);
        }

        .dot {
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--accent);
            animation: blink 1.5s infinite;
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .version {
            position: absolute;
            bottom: 2rem;
            right: 2rem;
            color: var(--text-dim);
            font-size: 0.8rem;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <div class="container">
        <div class="logo-container">
            <div class="logo-ring"></div>
            <img src="/public/logo.png" alt="Fastify API Logo" style="width: 100px; height: 100px; position: relative; z-index: 2;">
        </div>
        
        <h1>Fastify API Engine</h1>
        <p>A secure, scalable, and high-performance backend infrastructure powered by Node.js, Fastify, Redis, and MongoDB.</p>

        <div class="actions">
            <a href="/swagger" class="btn btn-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                API Documentation
            </a>
            <a href="/api/v1/health" class="btn btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                System Health
            </a>
        </div>

        <div class="status-badge">
            <div class="dot"></div>
            System Operational
        </div>
    </div>

    <div class="version">v1.0.0 | Project Learn</div>
</body>
</html>
        `;
        reply.type('text/html');
        return html;
    });
}, { name: "welcome-plugin", dependencies: ["basic-auth-plugin"] });
