import express from "express";
import compression from "compression";
import cors from "cors";
import { errorHandler } from "../middleware/errorHandler";

/**
 * Express application factory.
 *
 * Registers global middleware (body parsing, compression, CORS) and
 * the unified error handler.  Adding or removing middleware no longer
 * requires touching database or routing code.
 */
export function createApp(): express.Application {
  const app = express();

  app.set("port", process.env.PORT || 3000);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  app.use(cors());

  return app;
}

/**
 * Register the global error-handling middleware last,
 * after all routes have been mounted.
 */
export function registerErrorMiddleware(app: express.Application): void {
  app.use(errorHandler);
}
