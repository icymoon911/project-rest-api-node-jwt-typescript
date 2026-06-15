import { Request, Response, NextFunction } from "express";

/**
 * Custom application error with an HTTP status code and a machine-readable error code.
 *
 * Controllers throw `AppError` instead of calling `res.sendStatus(...)` directly.
 * The global error handler catches it and returns a uniform JSON body.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, unknown>;

  constructor(statusCode: number, errorCode: string, message?: string, details?: Record<string, unknown>) {
    super(message || errorCode);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global Express error-handling middleware.
 *
 * All errors thrown (or passed via `next(err)`) by controllers are caught here
 * and transformed into a uniform JSON response:
 *
 * ```json
 * { "status": "error", "code": "NOT_FOUND", "message": "..." }
 * ```
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      status: "error",
      code: err.errorCode,
      message: err.message,
    };
    if (err.details) {
      body.details = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // Unexpected / unhandled errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred.",
  });
}
