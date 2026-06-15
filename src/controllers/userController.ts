import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/userService";
import { UnauthorizedError } from "../middleware/AppError";

/**
 * UserController — registration and login.
 */
export class UserController {
  private userService: UserService;

  constructor(userService?: UserService) {
    this.userService = userService || new UserService();
  }

  public registerUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password, scope } = req.body;
    const token = await this.userService.register(username, password, scope);
    res.status(200).send({ token });
  };

  /**
   * Passport-local callback — we stay with callback style because
   * passport.authenticate does not reliably work with async/await.
   */
  public authenticateUser = (req: Request, res: Response, next: NextFunction) => {
    // Lazy require to avoid circular imports at module-load time
    const passport = require("passport");
    passport.authenticate("local", (err: Error, user: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new UnauthorizedError("Invalid username or password", "invalid_credentials"));
      }
      const token = this.userService.generateToken(user.username);
      res.status(200).send({ token });
    })(req, res, next);
  };
}
