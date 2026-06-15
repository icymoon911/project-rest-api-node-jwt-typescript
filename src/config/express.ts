import express from "express";
import compression from "compression";
import cors from "cors";

/**
 * Pure Express configuration — middleware, body-parsers, etc.
 * Adding a new middleware only requires editing this file.
 */
export function configureExpress(): express.Application {
  const app = express();

  app.set("port", process.env.PORT || 3000);
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(compression());
  app.use(cors());

  return app;
}
