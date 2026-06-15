import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/userController";

export class UserRoutes {

    router: Router;
    public userController: UserController = new UserController();

    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        // For TEST only ! In production, you should use an Identity Provider !!
        // #6: Wrap async handlers so thrown errors (e.g. duplicate username) are caught
        //     and returned as a 500 response instead of crashing the process.
        this.router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
            try {
                await this.userController.registerUser(req, res);
            } catch (err) {
                console.error("register error:", err);
                res.status(500).json({ status: "error", message: "Internal server error" });
            }
        });
        this.router.post("/login", (req: Request, res: Response, next: NextFunction) => {
            try {
                this.userController.authenticateUser(req, res, next);
            } catch (err) {
                console.error("login error:", err);
                res.status(500).json({ status: "error", message: "Internal server error" });
            }
        });
    }
}
