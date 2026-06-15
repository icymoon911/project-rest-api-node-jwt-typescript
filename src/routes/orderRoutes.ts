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
        // 获取订单列表（自己的；管理员预留：获取所有）
        this.router.get("/", this.authController.authenticateJWT, this.orderController.getOrders);
        // 创建订单
        this.router.post("/", this.authController.authenticateJWT, this.orderController.createOrder);
        // 取消订单
        this.router.put("/:orderId/cancel", this.authController.authenticateJWT, this.orderController.cancelOrder);
    }
}
