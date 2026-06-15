import { Router } from "express";
import { UserController } from "../controllers/userController";
import { UserService } from "../services/userService";

export class UserRoutes {

    router: Router;
    public userController: UserController;

    constructor() {
        this.router = Router();
        const userService = new UserService();
        this.userController = new UserController(userService);
        this.routes();
    }

    routes() {
        // For TEST only ! In production, you should use an Identity Provider !!
        this.router.post("/register", this.userController.registerUser);
        this.router.post("/login", this.userController.authenticateUser);
    }
}
