import { Request, Response, NextFunction } from "express";
import { AppError } from "./AppError";

export interface ErrorResponse {
  status: "error";
  code: string;
  message: string;
  statusCode: number;
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ErrorResponse = {
      status: "error",
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const body: ErrorResponse = {
      status: "error",
      code: "validation_error",
      message: err.message,
      statusCode: 400,
    };
    res.status(400).json(body);
    return;
  }

  // Mongoose cast error (bad ObjectId, etc.)
  if (err.name === "CastError") {
    const body: ErrorResponse = {
      status: "error",
      code: "bad_request",
      message: `Invalid value: ${(err as any).value}`,
      statusCode: 400,
    };
    res.status(400).json(body);
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const body: ErrorResponse = {
      status: "error",
      code: "duplicate",
      message: "Resource already exists",
      statusCode: 422,
    };
    res.status(422).json(body);
    return;
  }

  // Fallback — unexpected error
  console.error("Unhandled error:", err);
  const body: ErrorResponse = {
    status: "error",
    code: "internal_error",
    message: "An unexpected error occurred",
    statusCode: 500,
  };
  res.status(500).json(body);
}
