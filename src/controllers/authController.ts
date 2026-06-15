import { NextFunction, Request, Response } from "express";
import passport from "passport";
import "../auth/passportHandler";
import { AppError } from "../middleware/AppError";

/**
 * AuthController — JWT authentication & authorisation middleware.
 *
 * Shared JWT verification logic is extracted into `verifyJwt`,
 * then both `authenticateJWT` and `authorizeJWT` build on top of it.
 *
 * Error codes returned:
 *  - "token_expired"      → JWT has expired
 *  - "invalid_token"      → JWT is malformed or signature mismatch
 *  - "missing_token"      → No bearer token was provided
 *  - "user_not_found"     → Token is valid but the user no longer exists
 *  - "insufficient_scope" → Token lacks the required scope for this route
 *  - "unauthorized"       → Generic / unexpected auth failure
 */
export class AuthController {
  /**
   * Core JWT verification — shared between authenticate & authorize.
   * Resolves with { user, jwtToken } or forwards an AppError via next().
   */
  private verifyJwt(
    req: Request,
    res: Response,
    next: NextFunction,
    callback: (err: AppError | null, user: any, jwtToken: any) => void,
  ): void {
    passport.authenticate("jwt", (err: Error | null, user: any, jwtToken: any) => {
      if (err) {
        return callback(new AppError("Authentication failed", 401, "unauthorized"), null, null);
      }

      // `info` from passport-jwt surfaces as `jwtToken` being undefined when
      // the token is missing or expired. Passport puts specific messages in
      // the third argument when verification fails.
      if (!user) {
        // Distinguish common failure modes
        const info = jwtToken as any; // passport-jwt passes the info object here
        if (info) {
          const message = typeof info === "string" ? info : info.message || "";
          if (/expired/i.test(message)) {
            return callback(new AppError("Token has expired", 401, "token_expired"), null, null);
          }
          if (/invalid|malformed|signature/i.test(message)) {
            return callback(new AppError("Invalid token", 401, "invalid_token"), null, null);
          }
          if (/no auth|missing|provide/i.test(message)) {
            return callback(new AppError("Missing authentication token", 401, "missing_token"), null, null);
          }
        }
        return callback(new AppError("User not found or token invalid", 401, "user_not_found"), null, null);
      }

      callback(null, user, jwtToken);
    })(req, res, next);
  }

  /**
   * Authenticate — verifies the JWT is valid and the user exists.
   */
  public authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    this.verifyJwt(req, res, next, (err) => {
      if (err) {
        return next(err);
      }
      return next();
    });
  };

  /**
   * Authorize — verifies JWT *and* checks that the token's scope array
   * includes the last segment of the request URL (e.g. "/api/products" → "products").
   */
  public authorizeJWT = (req: Request, res: Response, next: NextFunction): void => {
    this.verifyJwt(req, res, next, (err, user, jwtToken) => {
      if (err) {
        return next(err);
      }
      const requiredScope = req.baseUrl.split("/").slice(-1)[0];
      const tokenScopes: string[] = (jwtToken && jwtToken.scope) || [];
      if (tokenScopes.indexOf(requiredScope) > -1) {
        return next();
      }
      return next(
        new AppError(
          `Scope "${requiredScope}" required`,
          403,
          "insufficient_scope",
        ),
      );
    });
  };
}
