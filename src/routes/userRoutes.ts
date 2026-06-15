import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/userController";

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export class UserRoutes {

    router: Router;
    public userController: UserController = new UserController();

    constructor() {
        this.router = Router();
        this.routes();
    }
    routes() {
        // For TEST only ! In production, you should use an Identity Provider !!
        this.router.post("/register", asyncHandler(this.userController.registerUser.bind(this.userController)));
        this.router.post("/login", this.userController.authenticateUser.bind(this.userController));
    }
}
