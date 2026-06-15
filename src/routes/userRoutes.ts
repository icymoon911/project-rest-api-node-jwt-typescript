import { Router } from "express";
import { UserController } from "../controllers/userController";
import { asyncHandler } from "../middleware/asyncHandler";

export class UserRoutes {
  router: Router;
  public userController: UserController = new UserController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    // For TEST only ! In production, you should use an Identity Provider !!
    this.router.post("/register", asyncHandler(this.userController.registerUser));
    this.router.post("/login", this.userController.authenticateUser);
  }
}
