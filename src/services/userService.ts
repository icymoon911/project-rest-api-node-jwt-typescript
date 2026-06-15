import bcrypt from "bcrypt-nodejs";
import * as jwt from "jsonwebtoken";
import { User } from "../models/user";
import { IUser } from "../models/user";
import { JWT_SECRET } from "../util/secrets";

/**
 * Service layer for User / authentication domain operations.
 *
 * Centralises password hashing, user creation, and JWT signing so that
 * controllers only deal with HTTP concerns.
 */
export class UserService {

  public async createUser(username: string, password: string, scope?: string[]): Promise<{ token: string }> {
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    await User.create({
      username,
      password: hashedPassword,
    });

    const token = jwt.sign({ username, scope }, JWT_SECRET as jwt.Secret);
    return { token };
  }

  public async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username: username.toLowerCase() });
  }

  public comparePassword(user: IUser, candidatePassword: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      user.comparePassword(candidatePassword, (err: Error, isMatch: boolean) => {
        if (err) { return reject(err); }
        resolve(isMatch);
      });
    });
  }

  public signToken(payload: object): string {
    return jwt.sign(payload, JWT_SECRET as jwt.Secret);
  }
}
