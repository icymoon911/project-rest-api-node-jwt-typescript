
import { Request, Response } from "express";
import { IProduct, Product } from "../models/product";

export class ProductController {

    public async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const products = await Product.find();
            res.json({ products });
        } catch (err) {
            res.status(500).json({ status: "error", message: "Failed to retrieve products." });
        }
    }

    public async getProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findOne({ productId: req.params.id });
            if (product === null) {
                res.sendStatus(404);
            } else {
                res.json(product);
            }
        } catch (err) {
            res.status(500).json({ status: "error", message: "Failed to retrieve product." });
        }
    }

    public async createProduct(req: Request, res: Response): Promise<void> {
        try {
            const newProduct: IProduct = new Product(req.body);
            const product = await Product.findOne({ productId: req.body.productId });
            if (product === null) {
                const result = await newProduct.save();
                if (result === null) {
                    res.sendStatus(500);
                } else {
                    res.status(201).json({ status: 201, data: result });
                }

            } else {
                res.sendStatus(422);
            }
        } catch (err) {
            res.status(500).json({ status: "error", message: "Failed to create product." });
        }
    }

    public async updateProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findOneAndUpdate({ productId: req.params.id }, req.body);
            if (product === null) {
                res.sendStatus(404);
            } else {
                const updatedProduct = { productId: req.params.id, ...req.body };
                res.json({ status: res.status, data: updatedProduct });
            }
        } catch (err) {
            res.status(500).json({ status: "error", message: "Failed to update product." });
        }
    }

    public async deleteProduct(req: Request, res: Response): Promise<void> {
        try {
            const product = await Product.findOneAndDelete({ productId: req.params.id });
            if (product === null) {
                res.sendStatus(404);
            } else {
                res.json({ response: "Product deleted Successfully" });
            }
        } catch (err) {
            res.status(500).json({ status: "error", message: "Failed to delete product." });
        }
    }
}
