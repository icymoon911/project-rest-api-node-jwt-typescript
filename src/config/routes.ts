import express from "express";
import { ProductRoutes } from "../routes/productRoutes";
import { UserRoutes } from "../routes/userRoutes";

/**
 * Register all application route modules on the given Express app.
 */
export function registerRoutes(app: express.Application): void {
  app.use("/api/user", new UserRoutes().router);
  app.use("/api/products", new ProductRoutes().router);
}
