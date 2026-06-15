import bcrypt from "bcrypt-nodejs";
import * as jwt from "jsonwebtoken";
import { IUser, User } from "../models/user";
import { JWT_SECRET } from "../util/secrets";
import { AppError } from "../middleware/AppError";

/**
 * UserService — authentication and user CRUD.
 */
export class UserService {
  public async register(
    username: string,
    password: string,
    scope?: string[],
  ): Promise<string> {
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    await User.create({ username, password: hashedPassword });
    const token = jwt.sign({ username, scope }, JWT_SECRET as string);
    return token;
  }

  /**
   * Generates a JWT for an already-verified user (used by passport-local callback).
   */
  public generateToken(username: string, scope?: string[]): string {
    return jwt.sign({ username, scope }, JWT_SECRET as string);
  }

  public async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username: username.toLowerCase() });
  }

  public comparePassword(
    user: IUser,
    candidatePassword: string,
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      user.comparePassword(candidatePassword, (err: Error, isMatch: boolean) => {
        if (err) {
          return reject(err);
        }
        resolve(isMatch);
      });
    });
  }
}
