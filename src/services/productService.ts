import { Product } from "../models/product";
import { IProduct } from "../models/product";

/**
 * Service layer for Product domain operations.
 *
 * All database access for products is funnelled through this class so that
 * controllers stay thin (HTTP in → JSON out) and storage can be swapped
 * without touching route handlers.
 */
export class ProductService {

  public async findAll(): Promise<IProduct[]> {
    return Product.find();
  }

  public async findByProductId(productId: string): Promise<IProduct | null> {
    return Product.findOne({ productId });
  }

  public async create(data: Partial<IProduct>): Promise<IProduct | null> {
    const product = new Product(data);
    return product.save();
  }

  public async updateByProductId(productId: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return Product.findOneAndUpdate({ productId }, data, { new: true });
  }

  public async deleteByProductId(productId: string): Promise<IProduct | null> {
    return Product.findOneAndDelete({ productId });
  }
}
