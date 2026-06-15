import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "passport";
import "../auth/passportHandler";
import { User } from "../models/user";
import { JWT_SECRET, JWT_EXPIRATION } from "../util/secrets";


export class UserController {

  public async registerUser(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    // #5: Input validation — reject empty or too-short credentials
    if (!username || typeof username !== "string" || username.trim().length === 0) {
      res.status(400).json({ status: "error", message: "Username is required." });
      return;
    }
    if (!password || typeof password !== "string" || password.trim().length === 0) {
      res.status(400).json({ status: "error", message: "Password is required." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ status: "error", message: "Password must be at least 6 characters long." });
      return;
    }

    // #1: Removed manual bcrypt.hashSync() — the User model's pre-save hook
    //     already hashes the password. Doing it twice caused login failures.
    await User.create({
      username: username,
      password: password,
    });

    // #4: JWT now includes expiresIn from the JWT_EXPIRATION env variable
    const token = jwt.sign(
      { username: username, scope: req.body.scope },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );
    res.status(200).send({ token: token });
  }

  public authenticateUser(req: Request, res: Response, next: NextFunction) {
    // #2: passport.authenticate() returns a middleware function. It MUST be
    //     invoked with (req, res, next) — otherwise the request hangs forever.
    //     Compare with authController.authenticateJWT which does this correctly.
    passport.authenticate("local", function (err, user, info) {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ status: "error", code: "unauthorized" });
      } else {
        // #4: JWT now includes expiresIn
        const token = jwt.sign(
          { username: user.username },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRATION }
        );
        res.status(200).send({ token: token });
      }
    })(req, res, next);
  }
}
