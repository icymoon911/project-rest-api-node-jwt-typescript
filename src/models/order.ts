import { Document, Schema, Model, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderId: string;
  userId: string;
  username: string;
  items: IOrderItem[];
  totalPrice: number;
  status: "pending" | "paid" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

export const orderSchema: Schema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4(),
    },
    userId: { type: String, required: true },
    username: { type: String, required: true },
    items: { type: [orderItemSchema], required: true, validate: [(v: any[]) => v.length > 0, "Order must contain at least one item"] },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Index for fast queries by user and by status
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order: Model<IOrder> = model<IOrder>("Order", orderSchema);
