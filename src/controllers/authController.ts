import { NextFunction, Request, Response } from "express";
import passport from "passport";
import "../auth/passportHandler";
import { AppError } from "../middleware/errorHandler";

/**
 * Shared JWT verification callback used by both `authenticateJWT` and `authorizeJWT`.
 *
 * Parses the Passport JWT result and throws a typed `AppError` so the global
 * error handler can return distinct error codes instead of a blanket
 * "unauthorized" for every failure mode.
 */
function handleJwtResult(
  err: Error | null,
  user: any,
  info: any,
  res: Response,
  next: NextFunction,
  onAuthenticated: (info: any) => void,
): void {
  if (err) {
    return next(new AppError(500, "AUTH_ERROR", "Authentication error occurred."));
  }
  if (!user) {
    // `info` from passport-jwt carries the failure reason.
    const message: string = (info && info.message) || "";
    if (message.toLowerCase().includes("expired")) {
      return next(new AppError(401, "TOKEN_EXPIRED", "JWT token has expired."));
    }
    return next(new AppError(401, "TOKEN_INVALID", "Invalid or missing JWT token."));
  }
  onAuthenticated(info);
}

export class AuthController {

  public authenticateJWT(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("jwt", (err: Error | null, user: any, info: any) => {
      handleJwtResult(err, user, info, res, next, () => {
        return next();
      });
    })(req, res, next);
  }

  public authorizeJWT(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("jwt", (err: Error | null, user: any, jwtToken: any) => {
      handleJwtResult(err, user, jwtToken, res, next, (token) => {
        const scope = req.baseUrl.split("/").slice(-1)[0];
        const authScope: string[] | undefined = token && token.scope;
        if (authScope && authScope.indexOf(scope) > -1) {
          return next();
        }
        return next(new AppError(403, "INSUFFICIENT_SCOPE", "Token does not have the required scope."));
      });
    })(req, res, next);
  }
}
