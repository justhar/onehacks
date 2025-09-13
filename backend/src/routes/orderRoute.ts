//order mau apa aja: buat order -> cek apakah cukup ->kalau gacukup ga valid, hitung harga, simpan order, simpan order items, update order
import { Hono } from "hono";
import db from "../lib/db.js";
import { snap } from "../lib/midtrans.js";
import { orders, orderItems, products, payments } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const orderRoute = new Hono();

orderRoute.post("/", async(c) => {
    const body = await c.req.json();
    const { buyerId, businessId, items, paymentMethod, deliveryMethod, deliveryAddress } = body;

    if (!items || items.length === 0)
        return c.json({error:"Choose minimum 1 product!"}, 400);
    if (deliveryMethod === "delivery" && !deliveryAddress) {
        return c.json({error: "Delivery requires location permission (lat, lng)"}, 400);
    }

    try {
        const result = await db.transaction(async (tx) => {
            let totalAmount =  0;
            let productType: string | null = null;

            for (const item of items) {
                const [product] = await tx
                .select()
                .from(products)
                .where(eq(products.id, item.productId));

                if (productType && productType !== product.type) {
                throw new Error("Order cannot mix different product types");
                }
                if (!product) throw new Error(`Product ${item.productId} not found!`);
                productType = product.type;
                if (Number(product.quantity) < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.title}`);
                }

                await tx 
                .update(products)
                .set({quantity: sql`${product.quantity} - ${item.quantity}`})
                .where(eq(products.id, item.productId));

            totalAmount += Number(item.price)*item.quantity;
            }

            if (productType === "sell") {
            const [newOrder] = await tx
            .insert(orders)
            .values({
                buyerId,
                businessId,
                totalAmount: String(totalAmount),
                type: "sell",
                status:"pending",
                deliveryMethod,
                deliveryAddress: deliveryMethod === "delivery" ? JSON.stringify(deliveryAddress) : null as string | null,
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
                })
            }

            const [newPayment] =  await tx
            .insert(payments)
            .values({
                orderId: newOrder.id,
                amount: String(totalAmount),
                status: "pending" as PaymentStatus,
                paymentMethod: paymentMethod ?? null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

            const transaction = await snap.createTransaction({
                transaction_details: {
                    order_id:`order-${newOrder.id}`,
                    gross_amount: totalAmount,
                },
                enabled_payments: ["gopay", "shopeepay", "bank_transfer"],
            });

            return {
                order: newOrder, 
                payment: newPayment,
                snapToken: transaction.token,
                snapRedirectUrl: transaction.redirect_url}; 
            } 
             
            else if (productType === "donation"){
                const [newOrder] = await tx
                .insert(orders)
                .values({
                buyerId,
                businessId,
                totalAmount: String(totalAmount),
                type:"donation",
                status:"requested",
                deliveryMethod,
                deliveryAddress: deliveryMethod === "delivery" ? JSON.stringify(deliveryAddress) : null as string | null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

            for (const item of items) {
                await tx.insert(orderItems).values({
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: "0",
                })
            };

            return { order: newOrder };
            };

        });
        
        return c.json(result);

        } catch (err: any) {
            return c.json({error: err.message}, 400);
        }
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


orderRoute.post("/notification", async (c) => {
  try {
    const body = await c.req.json();

    const orderId = body.order_id?.replace("order-", "");
    const transactionStatus = body.transaction_status;

    const paymentStatusMap: Record<string, PaymentStatus> = {
    success: "success",
    pending: "pending",
    failed: "failed",
    };

const newPaymentStatus: PaymentStatus =
  paymentStatusMap[transactionStatus] ?? "pending";

    const statusMap: Record<string, OrderStatus> = {
      settlement: "paid",
      capture: "paid",
      expire: "expired",
      cancel: "cancelled",
      deny: "denied",
    };

    const newStatus: OrderStatus = statusMap[transactionStatus] ?? "pending";

    if (!statusMap[transactionStatus]) {
      console.warn("⚠️ Unhandled Midtrans status:", transactionStatus);
    }

    if (!orderId) {
      return c.json({ error: "Invalid order_id" }, 400);
    }

    await db
    .update(payments)
    .set({ status: newPaymentStatus, updatedAt: new Date() })
    .where(eq(payments.orderId, Number(orderId)))
    .returning();

    await db
      .update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, Number(orderId)));

    return c.json({ success: true, orderId, orderStatus: newStatus, paymentStatus: newPaymentStatus });

  } catch (err) {
    console.error("Midtrans Notification Error:", err);
    return c.json({ error: "Webhook handling failed" }, 500);
  }
});


// Allowed status per mode
   type OrderType = "sell" | "donation";
    const allowedStatusesMap: Record<OrderType, OrderStatus[]> = {
    sell: ["ready", "delivered", "completed", "cancelled"],
    donation: ["requested", "pending", "completed", "cancelled"],
    };

    
// Seller / Charity update order status
orderRoute.patch("/:id/status", async (c) => {
  try {
    const orderId = Number(c.req.param("id"));
    const body = await c.req.json<{ status: OrderStatus }>();
    const { status } = body;

    // Cari order dulu
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }


    const orderType = order.type as OrderType;

    const allowedStatuses = allowedStatusesMap[orderType] ?? [];

    if (!allowedStatuses.includes(status)) {
      return c.json({ error: `Invalid status update for mode ${order.type}` }, 400);
    }

    // Update status
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, orderId))
      .returning();

    return c.json({ success: true, order: updatedOrder });
  } catch (err) {
    console.error("Update Order Status Error:", err);
    return c.json({ error: "Failed to update order status" }, 500);
  }
});

export default orderRoute;