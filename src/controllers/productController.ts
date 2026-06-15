
import { Request, Response } from "express";
import { IProduct, Product } from "../models/product";

export class ProductController {

    public async getProducts(req: Request, res: Response): Promise<void> {
        try {
            const products = await Product.find();
            res.json({ products });
        } catch (err) {
            console.error("getProducts error:", err);
            res.status(500).json({ status: "error", message: "Internal server error" });
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
            console.error("getProduct error:", err);
            res.status(500).json({ status: "error", message: "Internal server error" });
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
            console.error("createProduct error:", err);
            res.status(500).json({ status: "error", message: "Internal server error" });
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
            console.error("updateProduct error:", err);
            res.status(500).json({ status: "error", message: "Internal server error" });
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
            console.error("deleteProduct error:", err);
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
}
