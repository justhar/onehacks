//order mau apa aja: buat order -> cek apakah cukup ->kalau gacukup ga valid, hitung harga, simpan order, simpan order items, update order
import { Hono } from "hono";
import db from "../lib/db.js";
import { snap } from "../lib/midtrans.js";
import {
  orders,
  orderItems,
  products,
  payments,
  users,
  businessProfiles,
} from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { getAuthUser } from "../lib/auth.js";

const orderRoute = new Hono();

// Get orders for a user (buyer or seller)
orderRoute.get("/", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userOrders = await db
      .select({
        id: orders.id,
        buyerId: orders.buyerId,
        sellerId: orders.sellerId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        deliveryMethod: orders.deliveryMethod,
        deliveryAddress: orders.deliveryAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        sellerName: businessProfiles.businessName,
        paymentStatus: payments.status,
      })
      .from(orders)
      .leftJoin(businessProfiles, eq(orders.sellerId, businessProfiles.userId))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(orders.buyerId, authUser.userId));

    return c.json(userOrders);
  } catch (error) {
    console.error("Get orders error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get orders for seller (restaurant dashboard)
orderRoute.get("/seller", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const sellerOrders = await db
      .select({
        id: orders.id,
        buyerId: orders.buyerId,
        sellerId: orders.sellerId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        deliveryMethod: orders.deliveryMethod,
        deliveryAddress: orders.deliveryAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        buyerName: users.fullName,
        paymentStatus: payments.status,
      })
      .from(orders)
      .leftJoin(users, eq(orders.buyerId, users.id))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(orders.sellerId, authUser.userId));

    return c.json(sellerOrders);
  } catch (error) {
    console.error("Get seller orders error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

orderRoute.post("/", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const {
      sellerId,
      totalAmount,
      items,
      paymentMethod,
      deliveryMethod,
      deliveryAddress,
    } = body;

    if (!items || items.length === 0)
      return c.json({ error: "Choose minimum 1 product!" }, 400);
    if (deliveryMethod === "delivery" && !deliveryAddress) {
      return c.json({ error: "Delivery requires delivery address" }, 400);
    }

    try {
      const result = await db.transaction(async (tx) => {
        let calculatedTotal = 0;

        for (const item of items) {
          const [product] = await tx
            .select()
            .from(products)
            .where(eq(products.id, item.productId));

          if (!product) throw new Error(`Product ${item.productId} not found!`);
          if (Number(product.quantity) < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.title}`);
          }

          const newQuantity = Number(product.quantity) - item.quantity;
          await tx
            .update(products)
            .set({ quantity: newQuantity })
            .where(eq(products.id, item.productId));

          calculatedTotal += Number(item.price) * item.quantity;
        }

        const [newOrder] = await tx
          .insert(orders)
          .values({
            buyerId: authUser.userId,
            sellerId,
            totalAmount: String(totalAmount || calculatedTotal),
            status: "pending",
            deliveryMethod,
            deliveryAddress:
              deliveryMethod === "delivery" ? deliveryAddress : null,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        for (const item of items) {
          await tx.insert(orderItems).values({
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: String(item.price),
          });
        }

        const [newPayment] = await tx
          .insert(payments)
          .values({
            orderId: newOrder.id,
            status: "pending",
            paymentMethod: paymentMethod ?? null,
            createdAt: new Date(),
          })
          .returning();

        return {
          order: newOrder,
          payment: newPayment,
        };
      });

      return c.json(result);
    } catch (err: any) {
      console.error("Order creation error:", err);
      return c.json({ error: err.message }, 400);
    }
  } catch (error) {
    console.error("Order creation error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create payment for existing order
orderRoute.post("/:orderId/payment", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orderId } = c.req.param();

    // Get order details
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (order.length === 0) {
      return c.json({ error: "Order not found" }, 404);
    }

    // Check if user owns this order
    if (order[0].buyerId !== authUser.userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Check if already paid
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, parseInt(orderId)));

    if (payment.length > 0 && payment[0].status === "success") {
      return c.json({ error: "Order already paid" }, 400);
    }

    // If payment exists but not completed, return existing token
    if (payment.length > 0 && payment[0].transactionId) {
      return c.json({
        snapToken: payment[0].transactionId,
        snapEmbedUrl: `https://app.sandbox.midtrans.com/snap/v1/transactions/${payment[0].transactionId}/embed`,
      });
    }

    // Create unique transaction ID to avoid Midtrans order_id collision
    const uniqueOrderId = `order-${orderId}-${Date.now()}`;

    // Create Midtrans transaction
    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: uniqueOrderId,
        gross_amount: Number(order[0].totalAmount),
      },
      enabled_payments: ["gopay", "shopeepay", "bank_transfer", "credit_card"],
    });

    // Update payment with transaction ID
    await db
      .update(payments)
      .set({
        transactionId: transaction.token,
      })
      .where(eq(payments.orderId, parseInt(orderId)));

    return c.json({
      snapToken: transaction.token,
      snapEmbedUrl: `https://app.sandbox.midtrans.com/snap/v1/transactions/${transaction.token}/embed`,
    });
  } catch (error) {
    console.error("Payment creation error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Manually update payment status (called from frontend after payment success)
orderRoute.patch("/:orderId/payment-success", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orderId } = c.req.param();
    const { transactionId } = await c.req.json();

    // Verify the order belongs to the user
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)))
      .limit(1);

    if (order.length === 0) {
      return c.json({ error: "Order not found" }, 404);
    }

    if (order[0].buyerId !== authUser.userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    // Update payment status to success
    await db
      .update(payments)
      .set({
        status: "success",
        transactionId: transactionId,
      })
      .where(eq(payments.orderId, parseInt(orderId)));

    // Update order status to paid

    console.log(`Payment manually updated for order ${orderId}: success`);

    return c.json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Manual payment update error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update order status (for restaurant dashboard)
orderRoute.patch("/:orderId/status", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { orderId } = c.req.param();
    const { status } = await c.req.json();

    // Validate status
    const validStatuses = [
      "pending",
      "paid",
      "ready",
      "completed",
      "cancelled",
      "delivered",
    ];
    if (!validStatuses.includes(status)) {
      return c.json({ error: "Invalid status" }, 400);
    }

    // Check if the order belongs to the authenticated seller
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.id, parseInt(orderId)));

    if (order.length === 0) {
      return c.json({ error: "Order not found" }, 404);
    }

    if (order[0].sellerId !== authUser.userId) {
      return c.json({ error: "Unauthorized - Not your order" }, 403);
    }

    // Update order status
    await db
      .update(orders)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderId)));

    console.log(`Order ${orderId} status updated to: ${status}`);

    return c.json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Order status update error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default orderRoute;
