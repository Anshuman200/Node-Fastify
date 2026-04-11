import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { sendError } from "../utils/responseHandler.js";
import { HTTP_STATUS } from "../constants/httpStatusCodes.js";

export default fp(async function (fastify: FastifyInstance) {
    fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
        const accept = request.headers.accept || "";

        // If client accepts HTML, send the beautiful 404 page
        if (accept.includes("text/html")) {
            const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Engine Not Found | Learn Fastify API</title>
    <link rel="icon" type="image/x-icon" href="/public/favicon.ico">
    <style>
        :root {
            --primary: #4f46e5;
            --secondary: #06b6d4;
            --bg: #0f172a;
            --text: #f8fafc;
            --glass: rgba(255, 255, 255, 0.03);
            --border: rgba(255, 255, 255, 0.1);
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif; }

        body {
            background-color: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background-image: 
                radial-gradient(circle at 20% 30%, rgba(79, 70, 229, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(6, 182, 212, 0.15) 0%, transparent 50%);
        }

        .container {
            text-align: center;
            background: var(--glass);
            backdrop-filter: blur(12px);
            padding: 4rem;
            border-radius: 2rem;
            border: 1px solid var(--border);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            max-width: 600px;
            width: 90%;
            position: relative;
        }

        .error-code {
            font-size: 8rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            line-height: 1;
            margin-bottom: 1rem;
            filter: drop-shadow(0 0 20px rgba(79, 70, 229, 0.3));
        }

        h1 { font-size: 2rem; margin-bottom: 1.5rem; letter-spacing: -0.025em; }
        p { color: #94a3b8; line-height: 1.6; margin-bottom: 2.5rem; font-size: 1.1rem; }

        .btn {
            display: inline-flex;
            align-items: center;
            padding: 1rem 2rem;
            border-radius: 1rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
            background: var(--primary);
            color: white;
            box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4);
        }

        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.5);
            filter: brightness(1.1);
        }

        .gears {
            position: absolute;
            top: -50px;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0.1;
            z-index: -1;
        }

        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .gear-icon { animation: rotate 10s linear infinite; }
    </style>
</head>
<body>
    <div class="container">
        <div class="gears">
            <svg class="gear-icon" width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
        </div>
        <div class="error-code">404</div>
        <h1>Engine Not Found</h1>
        <p>The route you're looking for has either been decommissioned or never existed in this cluster. Let's get you back to the control center.</p>
        <a href="/" class="btn">Back to Control Center</a>
    </div>
</body>
</html>`;
            return reply.type("text/html").status(HTTP_STATUS.NOT_FOUND).send(html);
        }

        // Default JSON response for API clients
        return sendError(reply, HTTP_STATUS.NOT_FOUND, `Route ${request.method} ${request.url} not found`);
    });
});
