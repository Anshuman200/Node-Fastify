import "dotenv/config";
import buildApp from "./src/bootstrap.js";

const start = async () => {
    try {
        const app = await buildApp();

        await app.listen({
            port: process.env.PORT || 3333,
            host: "0.0.0.0"
        });

        console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();