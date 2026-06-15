import { Request, Response } from "express";
import { Order, IOrder, IOrderItem } from "../models/order";
import { Product } from "../models/product";

interface OrderItemInput {
  productId: string;
  quantity: number;
}

/**
 * Validate an array of order items.
 * Returns an error message string if invalid, or null if valid.
 */
function validateOrderItems(items: any): string | null {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return "Order must contain at least one item";
  }
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.productId || typeof item.productId !== "string" || item.productId.trim() === "") {
      return `Item at index ${i}: productId is required and must be a non-empty string`;
    }
    if (
      item.quantity === undefined ||
      item.quantity === null ||
      typeof item.quantity !== "number" ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      return `Item at index ${i}: quantity must be a positive integer`;
    }
  }
  return null;
}

export class OrderController {
  /**
   * POST /api/orders
   * Create a new order. Checks stock availability and deducts inventory.
   * Body: { items: [{ productId: string, quantity: number }] }
   */
  public async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { items } = req.body;

      // Parameter validation
      const validationError = validateOrderItems(items);
      if (validationError) {
        res.status(400).json({ status: "error", message: validationError });
        return;
      }

      const orderItems: IOrderItem[] = [];
      let totalPrice = 0;

      // Check stock and build order items
      for (const input of items as OrderItemInput[]) {
        const product = await Product.findOne({ productId: input.productId });
        if (!product) {
          res.status(404).json({
            status: "error",
            message: `Product with productId "${input.productId}" not found`,
          });
          return;
        }

        const availableQty = (product.quantity as number) || 0;
        if (availableQty < input.quantity) {
          res.status(400).json({
            status: "error",
            message: `Insufficient stock for product "${product.name}". Available: ${availableQty}, requested: ${input.quantity}`,
          });
          return;
        }

        const itemTotal = (product.price as number) * input.quantity;
        totalPrice += itemTotal;

        orderItems.push({
          productId: product.productId as string,
          name: product.name as string,
          price: product.price as number,
          quantity: input.quantity,
        });
      }

      // Deduct stock for all items
      for (const input of items as OrderItemInput[]) {
        await Product.findOneAndUpdate(
          { productId: input.productId },
          { $inc: { quantity: -input.quantity } }
        );
      }

      // Extract user info from request (set by authenticateJWT middleware)
      const user = (req as any).user;
      const userId = user ? user._id.toString() : "unknown";
      const username = user ? user.username : "unknown";

      const newOrder: IOrder = new Order({
        userId,
        username,
        items: orderItems,
        totalPrice,
        status: "pending",
      });

      const savedOrder = await newOrder.save();
      res.status(201).json({ status: 201, data: savedOrder });
    } catch (err) {
      console.error("createOrder error:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }

  /**
   * GET /api/orders
   * Get current user's orders, sorted by createdAt descending.
   */
  public async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user) {
        res.status(401).json({ status: "error", message: "Unauthorized" });
        return;
      }
      const userId = user._id.toString();
      const orders = await Order.find({ userId }).sort({ createdAt: -1 });
      res.json({ orders });
    } catch (err) {
      console.error("getMyOrders error:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }

  /**
   * GET /api/orders/all
   * Admin endpoint: get all orders, sorted by createdAt descending.
   * Requires isAdmin flag on user.
   */
  public async getAllOrders(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        res.status(403).json({ status: "error", message: "Forbidden: admin access required" });
        return;
      }
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json({ orders });
    } catch (err) {
      console.error("getAllOrders error:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }

  /**
   * GET /api/orders/:orderId
   * Get a single order by orderId. Users can only view their own orders (unless admin).
   */
  public async getOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await Order.findOne({ orderId: req.params.orderId });
      if (!order) {
        res.status(404).json({ status: "error", message: "Order not found" });
        return;
      }

      const user = (req as any).user;
      // Non-admin users can only view their own orders
      if (user && !user.isAdmin && order.userId !== user._id.toString()) {
        res.status(403).json({ status: "error", message: "Forbidden" });
        return;
      }

      res.json({ data: order });
    } catch (err) {
      console.error("getOrder error:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }

  /**
   * PUT /api/orders/:orderId/cancel
   * Cancel a pending order. Restores stock. Only the order owner can cancel.
   */
  public async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await Order.findOne({ orderId: req.params.orderId });
      if (!order) {
        res.status(404).json({ status: "error", message: "Order not found" });
        return;
      }

      const user = (req as any).user;
      if (!user || order.userId !== user._id.toString()) {
        res.status(403).json({ status: "error", message: "Forbidden: you can only cancel your own orders" });
        return;
      }

      if (order.status !== "pending") {
        res.status(400).json({
          status: "error",
          message: `Cannot cancel order with status "${order.status}". Only pending orders can be cancelled.`,
        });
        return;
      }

      // Restore stock for each item
      for (const item of order.items) {
        await Product.findOneAndUpdate(
          { productId: item.productId },
          { $inc: { quantity: item.quantity } }
        );
      }

      order.status = "cancelled";
      const updatedOrder = await order.save();

      res.json({ status: 200, data: updatedOrder, message: "Order cancelled and stock restored" });
    } catch (err) {
      console.error("cancelOrder error:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }

  /**
   * PUT /api/orders/:orderId/pay
   * Mark an order as paid. Only the order owner can pay.
   */
  public async payOrder(req: Request, res: Response): Promise<void> {
    try {
      const order = await Order.findOne({ orderId: req.params.orderId });
      if (!order) {
        res.status(404).json({ status: "error", message: "Order not found" });
        return;
      }

      const user = (req as any).user;
      if (!user || order.userId !== user._id.toString()) {
        res.status(403).json({ status: "error", message: "Forbidden: you can only pay your own orders" });
        return;
      }

      if (order.status !== "pending") {
        res.status(400).json({
          status: "error",
          message: `Cannot pay order with status "${order.status}". Only pending orders can be paid.`,
        });
        return;
      }

      order.status = "paid";
      const updatedOrder = await order.save();

      res.json({ status: 200, data: updatedOrder, message: "Order marked as paid" });
    } catch (err) {
      console.error("payOrder error:", err);
      res.status(500).json({ status: "error", message: "Internal server error" });
    }
  }
}
