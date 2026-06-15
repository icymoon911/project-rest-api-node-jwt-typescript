import passport from "passport";
import passportLocal from "passport-local";
import passportJwt from "passport-jwt";
import { User, IUser } from "../models/user";
import { JWT_SECRET } from "../util/secrets";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;

passport.use(
  new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username.toLowerCase() });
      if (!user) {
        return done(undefined, false, { message: `username ${username} not found.` });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(undefined, user);
        }
        return done(undefined, false, { message: "Invalid username or password." });
      });
    } catch (err) {
      return done(err);
    }
  }),
);

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
      passReqToCallback: false,
    },
    async (jwtToken: any, done: any) => {
      try {
        const user = await User.findOne({ username: jwtToken.username });
        if (user) {
          // Pass the decoded token as the third arg so AuthController.authorizeJWT
          // can inspect the scope array.
          return done(undefined, user, jwtToken);
        }
        return done(undefined, false, { message: "User not found" });
      } catch (err) {
        return done(err, false);
      }
    },
  ),
);
