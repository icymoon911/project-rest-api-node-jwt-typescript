import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { AppError } from "../middleware/errorHandler";

export class ProductController {
  private productService: ProductService;

  constructor(productService: ProductService) {
    this.productService = productService;
  }

  public async getProducts(_req: Request, res: Response): Promise<void> {
    const products = await this.productService.findAll();
    res.json({ products });
  }

  public async getProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.findByProductId(req.params.id);
    if (product === null) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", `Product with id '${req.params.id}' not found.`);
    }
    res.json(product);
  }

  public async createProduct(req: Request, res: Response): Promise<void> {
    const existing = await this.productService.findByProductId(req.body.productId);
    if (existing !== null) {
      throw new AppError(422, "PRODUCT_ALREADY_EXISTS", `Product with id '${req.body.productId}' already exists.`);
    }
    const result = await this.productService.create(req.body);
    if (result === null) {
      throw new AppError(500, "CREATE_FAILED", "Failed to create product.");
    }
    res.status(201).json({ status: 201, data: result });
  }

  public async updateProduct(req: Request, res: Response): Promise<void> {
    const updatedProduct = await this.productService.updateByProductId(req.params.id, req.body);
    if (updatedProduct === null) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", `Product with id '${req.params.id}' not found.`);
    }
    res.json({ status: 200, data: updatedProduct });
  }

  public async deleteProduct(req: Request, res: Response): Promise<void> {
    const product = await this.productService.deleteByProductId(req.params.id);
    if (product === null) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", `Product with id '${req.params.id}' not found.`);
    }
    res.json({ response: "Product deleted Successfully" });
  }
}
