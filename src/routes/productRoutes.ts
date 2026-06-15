import { Router } from "express";
import { ProductController } from "../controllers/productController";
import { AuthController } from "../controllers/authController";
import { ProductService } from "../services/productService";

export class ProductRoutes {

    public router: Router;
    public productController: ProductController;
    public authController: AuthController;

    constructor() {
        this.router = Router();
        const productService = new ProductService();
        this.productController = new ProductController(productService);
        this.authController = new AuthController();
        this.routes();
    }

    routes() {
        this.router.get("/", this.productController.getProducts);
        this.router.get("/:id", this.productController.getProduct);
        this.router.post("/", this.authController.authenticateJWT, this.productController.createProduct);
        this.router.put("/:id", this.authController.authenticateJWT, this.productController.updateProduct);
        this.router.delete("/:id", this.authController.authenticateJWT, this.productController.deleteProduct);
    }
}
