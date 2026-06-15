import { Document, Schema, Model, model } from "mongoose";

export interface IProduct extends Document {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export const productSchema = new Schema({
  productId: {
    type: String,
    required: true,
    unique: true,
  },
  name: String,
  price: Number,
  quantity: Number,
});

export const Product: Model<IProduct> = model<IProduct>("Product", productSchema);
