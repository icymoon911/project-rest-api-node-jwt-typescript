import { Document, Schema, Model, model } from "mongoose";

export interface IOrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

export interface IOrder extends Document {
    orderId: string;
    username: string;
    items: IOrderItem[];
    totalPrice: number;
    status: string;       // "pending" | "paid" | "cancelled"
    createdAt: Date;
}

export const orderItemSchema = new Schema({
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
});

export const orderSchema = new Schema({
    orderId: {
        type: String, required: true, unique: true,
    },
    username: {
        type: String, required: true,
    },
    items: [orderItemSchema],
    totalPrice: {
        type: Number, required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ["pending", "paid", "cancelled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export const Order: Model<IOrder> = model<IOrder>("Order", orderSchema);
