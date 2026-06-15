import { Router, Request, Response, NextFunction } from "express";
import { ProductController } from "../controllers/productController";
import { AuthController } from "../controllers/authController";

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

export class ProductRoutes {

    public router: Router;
    public productController: ProductController = new ProductController();
    public authController: AuthController = new AuthController();

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.get("/", asyncHandler(this.productController.getProducts.bind(this.productController)));
        this.router.get("/:id", asyncHandler(this.productController.getProduct.bind(this.productController)));
        this.router.post("/", this.authController.authenticateJWT, asyncHandler(this.productController.createProduct.bind(this.productController)));
        this.router.put("/:id", this.authController.authenticateJWT, asyncHandler(this.productController.updateProduct.bind(this.productController)));
        this.router.delete("/:id", this.authController.authenticateJWT, asyncHandler(this.productController.deleteProduct.bind(this.productController)));
    }
}
