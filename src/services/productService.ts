import { IProduct, Product } from "../models/product";
import { NotFoundError, DuplicateError } from "../middleware/AppError";

/**
 * ProductService — all database operations for products live here.
 * Controllers delegate to this service so swapping storage or
 * adding a caching layer only requires changes in this file.
 */
export class ProductService {
  public async findAll(): Promise<IProduct[]> {
    return Product.find();
  }

  public async findByProductId(productId: string): Promise<IProduct> {
    const product = await Product.findOne({ productId });
    if (!product) {
      throw new NotFoundError("Product");
    }
    return product;
  }

  public async create(data: Partial<IProduct>): Promise<IProduct> {
    const existing = await Product.findOne({ productId: data.productId });
    if (existing) {
      throw new DuplicateError("Product");
    }
    const product = new Product(data);
    const result = await product.save();
    if (!result) {
      throw new Error("Failed to save product");
    }
    return result;
  }

  public async update(productId: string, data: Partial<IProduct>): Promise<IProduct> {
    const updated = await Product.findOneAndUpdate(
      { productId },
      data,
      { new: true },
    );
    if (!updated) {
      throw new NotFoundError("Product");
    }
    return updated;
  }

  public async delete(productId: string): Promise<IProduct> {
    const deleted = await Product.findOneAndDelete({ productId });
    if (!deleted) {
      throw new NotFoundError("Product");
    }
    return deleted;
  }
}
