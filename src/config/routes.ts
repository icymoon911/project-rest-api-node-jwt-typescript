import express from "express";
import { ProductRoutes } from "../routes/productRoutes";
import { UserRoutes } from "../routes/userRoutes";
import { errorHandler } from "../middleware/errorHandler";

/**
 * Centralised route registration.
 * The global error-handler is mounted last so it catches errors from all routes.
 */
export function registerRoutes(app: express.Application): void {
  app.use("/api/user", new UserRoutes().router);
  app.use("/api/products", new ProductRoutes().router);

  // Global error handler — must be registered after all routes
  app.use(errorHandler);
}
