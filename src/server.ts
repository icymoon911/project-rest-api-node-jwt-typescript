import express from "express";
import { configureExpress } from "./config/express";
import { registerRoutes } from "./config/routes";
import { connectDatabase } from "./database/connection";

/**
 * Application bootstrap — each concern lives in its own module:
 *   - config/express.ts  → middleware & body-parser setup
 *   - config/routes.ts   → route registration + global error handler
 *   - database/connection.ts → MongoDB connection with retry
 */
class Server {
  public app: express.Application;

  constructor() {
    this.app = configureExpress();
    registerRoutes(this.app);
  }

  public async start(): Promise<void> {
    await connectDatabase();
    this.app.listen(this.app.get("port"), () => {
      console.log(
        "  API is running at http://localhost:%d",
        this.app.get("port"),
      );
    });
  }
}

const server = new Server();
server.start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
