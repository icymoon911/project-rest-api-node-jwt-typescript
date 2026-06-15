import { NextFunction, Request, Response } from "express";
import passport from "passport";
import "../auth/passportHandler";
import { UserService } from "../services/userService";
import { AppError } from "../middleware/errorHandler";

export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async registerUser(req: Request, res: Response): Promise<void> {
    const { username, password, scope } = req.body;
    const result = await this.userService.createUser(username, password, scope);
    res.status(200).send(result);
  }

  public authenticateUser(req: Request, res: Response, next: NextFunction): void {
    passport.authenticate("local", (err: Error | null, user: any, _info: any) => {
      if (err) { return next(err); }
      if (!user) {
        return next(new AppError(401, "INVALID_CREDENTIALS", "Invalid username or password."));
      }
      const token = this.userService.signToken({ username: user.username });
      res.status(200).send({ token });
    })(req, res, next);
  }
}
