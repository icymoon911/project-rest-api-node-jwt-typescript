import { Request, Response } from "express";
import { ProductService } from "../services/productService";

/**
 * ProductController — thin HTTP layer; all business logic is in ProductService.
 */
export class ProductController {
  private productService: ProductService;

  constructor(productService?: ProductService) {
    this.productService = productService || new ProductService();
  }

  public getProducts = async (req: Request, res: Response): Promise<void> => {
    const products = await this.productService.findAll();
    res.json({ products });
  };

  public getProduct = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.findByProductId(req.params.id);
    res.json(product);
  };

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    const result = await this.productService.create(req.body);
    res.status(201).json({ status: 201, data: result });
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    const updated = await this.productService.update(req.params.id, req.body);
    res.json({ status: 200, data: updated });
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    await this.productService.delete(req.params.id);
    res.json({ response: "Product deleted Successfully" });
  };
}
