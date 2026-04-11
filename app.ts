import "dotenv/config";
import buildApp from "./src/bootstrap.js";

const start = async () => {
    try {
        const app = await buildApp();

        const port = Number(process.env.PORT) || 3333;

        await app.listen({
            port,
            host: "0.0.0.0"
        });

        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📜 Documentation: http://localhost:${port}/swagger`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();