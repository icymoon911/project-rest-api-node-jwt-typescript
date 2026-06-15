import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { Order, IOrder } from "../models/order";
import { Product } from "../models/product";
import { User } from "../models/user";

export class OrderController {

    /**
     * POST /api/orders
     * 创建订单。请求体：{ items: [{ productId, quantity }] }
     * - 校验参数
     * - 检查库存，不足则友好提示
     * - 扣减库存
     * - 生成订单号并保存
     */
    public async createOrder(req: Request, res: Response): Promise<void> {
        const { items } = req.body;

        // ---- 基本参数校验 ----
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ status: "error", message: "订单商品列表不能为空" });
            return;
        }

        for (const item of items) {
            if (!item.productId || typeof item.productId !== "string" || item.productId.trim() === "") {
                res.status(400).json({ status: "error", message: "商品ID不能为空" });
                return;
            }
            if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
                res.status(400).json({ status: "error", message: "商品数量必须是正整数" });
                return;
            }
        }

        // ---- 检查库存 & 计算总价 ----
        const orderItems: any[] = [];
        let totalPrice = 0;

        for (const item of items) {
            const product = await Product.findOne({ productId: item.productId });
            if (product === null) {
                res.status(404).json({
                    status: "error",
                    message: `商品 ${item.productId} 不存在`,
                });
                return;
            }
            if (product.quantity < item.quantity) {
                res.status(400).json({
                    status: "error",
                    message: `商品 ${product.name} 库存不足，当前库存: ${product.quantity}，需要: ${item.quantity}`,
                });
                return;
            }
            orderItems.push({
                productId: product.productId,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            });
            totalPrice += (product.price as number) * item.quantity;
        }

        // ---- 扣减库存 ----
        for (const item of items) {
            await Product.findOneAndUpdate(
                { productId: item.productId },
                { $inc: { quantity: -item.quantity } },
            );
        }

        // ---- 创建订单 ----
        const order: IOrder = new Order({
            orderId: uuidv4(),
            username: (req.user as any).username,
            items: orderItems,
            totalPrice,
            status: "pending",
            createdAt: new Date(),
        });

        const result = await order.save();
        res.status(201).json({ status: 201, data: result });
    }

    /**
     * GET /api/orders
     * 获取当前登录用户的订单列表（按下单时间倒序）。
     * 管理员（isAdmin=true）可查看所有订单（预留）。
     */
    public async getOrders(req: Request, res: Response): Promise<void> {
        const user = req.user as any;
        const username = user.username;

        // 管理员标识预留：从数据库读取 isAdmin 字段
        // 当 User 模型扩展了 isAdmin 字段后，此处自动生效
        const userDoc = await User.findOne({ username });
        const isAdmin = userDoc && (userDoc as any).isAdmin === true;

        let orders;
        if (isAdmin) {
            // 管理员查看所有订单
            orders = await Order.find().sort({ createdAt: -1 });
        } else {
            // 普通用户查看自己的订单
            orders = await Order.find({ username }).sort({ createdAt: -1 });
        }

        res.json({ orders });
    }

    /**
     * PUT /api/orders/:orderId/cancel
     * 取消待支付订单，库存回补。
     * 只能取消自己的订单（管理员可取消任意订单）。
     */
    public async cancelOrder(req: Request, res: Response): Promise<void> {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (order === null) {
            res.status(404).json({ status: "error", message: "订单不存在" });
            return;
        }

        const user = req.user as any;
        const userDoc = await User.findOne({ username: user.username });
        const isAdmin = userDoc && (userDoc as any).isAdmin === true;

        // 权限检查：只能取消自己的订单，管理员可取消任意订单
        if (order.username !== user.username && !isAdmin) {
            res.status(403).json({ status: "error", message: "无权取消此订单" });
            return;
        }

        if (order.status !== "pending") {
            res.status(400).json({
                status: "error",
                message: `订单状态为 ${order.status}，无法取消。只有待支付状态的订单可以取消`,
            });
            return;
        }

        // 回补库存
        for (const item of order.items) {
            await Product.findOneAndUpdate(
                { productId: item.productId },
                { $inc: { quantity: item.quantity } },
            );
        }

        // 更新订单状态
        order.status = "cancelled";
        const result = await order.save();
        res.json({ status: 200, data: result });
    }
}
