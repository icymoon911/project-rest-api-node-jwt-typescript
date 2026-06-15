import { Router } from "express";
import { OrderController } from "../controllers/orderController";
import { AuthController } from "../controllers/authController";

export class OrderRoutes {
  public router: Router;
  public orderController: OrderController = new OrderController();
  public authController: AuthController = new AuthController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    // All order routes require JWT authentication
    this.router.post("/", this.authController.authenticateJWT, this.orderController.createOrder);
    this.router.get("/", this.authController.authenticateJWT, this.orderController.getMyOrders);
    this.router.get("/all", this.authController.authenticateJWT, this.orderController.getAllOrders);
    this.router.get("/:orderId", this.authController.authenticateJWT, this.orderController.getOrder);
    this.router.put("/:orderId/cancel", this.authController.authenticateJWT, this.orderController.cancelOrder);
    this.router.put("/:orderId/pay", this.authController.authenticateJWT, this.orderController.payOrder);
  }
}
