import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler so thrown errors / rejections
 * are automatically forwarded to Express' error-handling pipeline
 * (i.e. the global errorHandler middleware).
 */
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

export function asyncHandler(fn: AsyncHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
