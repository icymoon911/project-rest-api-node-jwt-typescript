import { NextFunction, Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import passport from "passport";
import "../auth/passportHandler";
import { User } from "../models/user";
import { JWT_SECRET, JWT_EXPIRATION } from "../util/secrets";


export class UserController {

  public async registerUser(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (!username || typeof username !== "string" || username.trim().length === 0) {
      res.status(400).json({ status: "error", message: "Username is required and cannot be empty." });
      return;
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      res.status(400).json({ status: "error", message: "Password is required and must be at least 6 characters." });
      return;
    }

    try {
      await User.create({
        username: username.trim(),
        password: password,
      });

      const token = jwt.sign(
        { username: username.trim(), scope: req.body.scope },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );
      res.status(201).send({ token: token });
    } catch (err) {
      if (err.code === 11000) {
        res.status(409).json({ status: "error", message: "Username already exists." });
      } else {
        res.status(500).json({ status: "error", message: "Internal server error during registration." });
      }
    }
  }

  public authenticateUser(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("local", function (err, user, info) {
      // no async/await because passport works only with callback ..
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ status: "error", code: "unauthorized" });
      } else {
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
