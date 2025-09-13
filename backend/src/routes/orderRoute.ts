//order mau apa aja: buat order -> cek apakah cukup ->kalau gacukup ga valid, hitung harga, simpan order, simpan order items, update order
import { Hono } from "hono";
import db from "../lib/db.js";
import { snap } from "../lib/midtrans.js";
import {
  orders,
  orderItems,
  products,
  payments, 
  businessProfiles, 
  withdraw,
  users,
} from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { getAuthUser } from "../lib/auth.js";
import { Insertable } from "drizzle-orm";

const orderRoute = new Hono();

// Get orders for a user (buyer or business)
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
        businessId: orders.businessId,
        totalAmount: orders.totalAmount,
        status: orders.status,
        deliveryMethod: orders.deliveryMethod,
        deliveryAddress: orders.deliveryAddress,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        businessName: businessProfiles.businessName,
        paymentStatus: payments.status,
      })
      .from(orders)
      .leftJoin(businessProfiles, eq(orders.businessId, businessProfiles.userId))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(orders.buyerId, authUser.userId));

    return c.json(userOrders);
  } catch (error) {
    console.error("Get orders error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get orders for business (restaurant dashboard)
orderRoute.get("/business", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const businessOrders = await db
      .select({
        id: orders.id,
        buyerId: orders.buyerId,
        businessId: orders.businessId,
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
      .where(eq(orders.businessId, authUser.userId));

    return c.json(businessOrders);
  } catch (error) {
    console.error("Get business orders error:", error);
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
      businessId,
      items,
      paymentMethod,
      deliveryMethod,
      deliveryAddress,
    } = body;

    if (!items || items.length === 0) {
      return c.json({ error: "Choose minimum 1 product!" }, 400);
    }

    if (deliveryMethod === "delivery" && !deliveryAddress) {
      return c.json({ error: "Delivery requires location (lat, lng)" }, 400);
    }

    const result = await db.transaction(async (tx) => {
      let totalAmount = 0;
      let productType: string | null = null;

      for (const item of items) {
        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, item.productId));

        if (!product) throw new Error(`Product ${item.productId} not found!`);

        if (productType && productType !== product.type) {
          throw new Error("Order cannot mix different product types");
        }

        productType = product.type;

        if (Number(product.quantity) < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.title}`);
        }

        await tx
          .update(products)
          .set({ quantity: Number(product.quantity) - item.quantity })
          .where(eq(products.id, item.productId));

        totalAmount += Number(item.price) * item.quantity;
      }

      const orderValues: Insertable<typeof orders> = {
        buyerId: authUser.userId,
        businessId: businessId ?? null,
        totalAmount: totalAmount,
        type: productType,
        status: productType === "donation" ? "requested" : "pending",
        deliveryMethod,
        deliveryAddress:
          deliveryMethod === "delivery"
            ? JSON.stringify(deliveryAddress)
            : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const [newOrder] = await tx.insert(orders).values(orderValues).returning();

      for (const item of items) {
        await tx.insert(orderItems).values({
          orderId: newOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          price: productType === "donation" ? "0" : String(item.price),
        });
      }

      if (productType === "donation") {
        return { order: newOrder };
      }

      const paymentValues: Insertable<typeof payments> = {
        orderId: newOrder.id,
        amount: totalAmount,
        status: "pending",
        paymentMethod: paymentMethod ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        };

        const [newPayment] = await tx
        .insert(payments)
        .values(paymentValues)
        .returning();

      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: `order-${newOrder.id}`,
          gross_amount: totalAmount,
        },
        enabled_payments: ["gopay", "shopeepay", "bank_transfer"],
        callbacks: {
          finish: "https://www.webtoons.com/id/",
        },
      });

      return {
        order: newOrder,
        payment: newPayment,
        snapToken: transaction.token,
        snapRedirectUrl: transaction.redirect_url,
      };
    });

    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, 400);
  }
});



orderRoute.post("/withdraw", async (c) => {
    const {businessId, amount, status, destination, paymentMethod} = await c.req.json();
    if ( amount<= 0) {
        return c.json({error:"Amount must be greater than 0"}, 400);
    }
    if (!destination || destination=== "null") {
        return c.json({error: "Required destination to transfer the money"}, 400);
    }
    if (!paymentMethod) {
        return c.json({error: "there is no option"})
    }

    const [business] = await db
    .select()
    .from(businessProfiles)
    .where(eq(businessProfiles.id, businessId));

    if(!business) {
        return c.json({ error: "Business not found"}, 404);
    }   

    if (Number(business.balance) < amount) {
        return c.json({ error: "Insufficient balance"}, 400);
    }

    const newWithdraw = await db.transaction(async (tx) => { 
    const [withDrawRecord] = await tx
    .insert(withdraw)
    .values({
            businessId: businessId,
            amount,
            status: "pending" as withdrawStatus,
            destination,
            paymentMethod: paymentMethod ?? null,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
        .returning();

        await tx
        .update(businessProfiles)
        .set({
            balance: sql`${businessProfiles.balance} - ${amount}`,
            updatedAt: new Date(), 
        })
        .where(eq(businessProfiles.id, businessId));
        return withDrawRecord;});

        return c.json({ 
            success: true, 
            withdraw: newWithdraw,
            message: "Withdraw request created successfully",
        });
});

// Midtrans Notification (Webhook)
type OrderStatus =
  | "pending"
  | "requested"
  | "paid"
  | "delivered"
  | "ready"
  | "completed"
  | "cancelled"
  | "expired"
  | "denied";

  type PaymentStatus =
  | "pending"
  | "success"
  | "failed";

    type withdrawStatus =
  | "pending"
  | "success"
  | "failed";

orderRoute.post("/initiate", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) return c.json({ error: "Unauthorized" }, 401);

    const { orderId } = await c.req.json();

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(orderId)));

    if (!order) return c.json({ error: "Order not found" }, 404);
    if (order.buyerId !== authUser.userId) return c.json({ error: "Forbidden" }, 403);

    const uniqueOrderId = `order-${orderId}-${Date.now()}`;

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: uniqueOrderId,
        gross_amount: Number(order.totalAmount),
      },
      enabled_payments: ["gopay", "shopeepay", "bank_transfer", "credit_card"],
    });

    await db
      .update(payments)
      .set({
        transactionId: transaction.token,
        updatedAt: new Date(),
      })
      .where(eq(payments.orderId, Number(orderId)));

    return c.json({
      snapToken: transaction.token,
      snapEmbedUrl: `https://app.sandbox.midtrans.com/snap/v1/transactions/${transaction.token}/embed`,
    });
  } catch (err) {
    console.error("Initiate Payment Error:", err);
    return c.json({ error: "Failed to initiate payment" }, 500);
  }
});

orderRoute.post("/webhook", async (c) => {
  try {
    const body = await c.req.json();
    const orderId = body.order_id?.replace("order-", "").split("-")[0]; // ambil ID asli

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number(orderId)));

    if (!order) return c.json({ error: "Order not found" }, 404);

    const transactionStatus = body.transaction_status;

    const paymentStatusMap: Record<string, PaymentStatus> = {
      success: "success",
      pending: "pending",
      failed: "failed",
    };

    const orderStatusMap: Record<string, OrderStatus> = {
      settlement: "paid",
      capture: "paid",
      expire: "expired",
      cancel: "cancelled",
      deny: "denied",
    };

    const newPaymentStatus = paymentStatusMap[transactionStatus] ?? "pending";
    const newOrderStatus = orderStatusMap[transactionStatus] ?? "pending";

    await db
      .update(payments)
      .set({
        status: newPaymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(payments.orderId, Number(orderId)));

    await db
      .update(orders)
      .set({
        status: newOrderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, Number(orderId)));

    if (newPaymentStatus === "success") {
      await db
        .update(businessProfiles)
        .set({
          balance: sql`${businessProfiles.balance} + ${body.gross_amount}`,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.id, Number(order.businessId)));
    }

    return c.json({
      success: true,
      orderId,
      orderStatus: newOrderStatus,
      paymentStatus: newPaymentStatus,
    });
  } catch (err) {
    console.error("Webhook Error:", err);
    return c.json({ error: "Webhook processing failed" }, 500);
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
orderRoute.patch("/:orderId/status", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) return c.json({ error: "Unauthorized" }, 401);

    const orderId = Number(c.req.param("orderId"));
    const { status } = await c.req.json<{ status: OrderStatus }>();

    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) return c.json({ error: "Order not found" }, 404);
    if (order.businessId !== authUser.userId) return c.json({ error: "Forbidden" }, 403);

    type OrderType = "sell" | "donation";
    type OrderStatus =
    | "pending"
    | "requested"
    | "paid"
    | "ready"
    | "delivered"
    | "completed"
    | "cancelled"
    | "expired"
    | "denied";

    const allowedStatusesMap: Record<OrderType, OrderStatus[]> = {
      sell: ["ready", "delivered", "completed", "cancelled"],
      donation: ["requested", "pending", "completed", "cancelled"],
    };

    const orderType = order.type as OrderType;
    const allowedStatuses = allowedStatusesMap[orderType] ?? [];

    if (!allowedStatuses.includes(status)) {
      return c.json({ error: `Invalid status update for mode ${orderType}` }, 400);
    }

    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Order status update error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default orderRoute;