import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { AuthController } from "../controllers/authController";
import { asyncHandler } from "../middleware/asyncHandler";

export class ProductRoutes {
  public router: Router;
  public productController: ProductController = new ProductController();
  public authController: AuthController = new AuthController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get("/", asyncHandler(this.productController.getProducts));
    this.router.get("/:id", asyncHandler(this.productController.getProduct));
    this.router.post("/", this.authController.authenticateJWT, asyncHandler(this.productController.createProduct));
    this.router.put("/:id", this.authController.authenticateJWT, asyncHandler(this.productController.updateProduct));
    this.router.delete("/:id", this.authController.authenticateJWT, asyncHandler(this.productController.deleteProduct));
  }
}
