//order mau apa aja: buat order -> cek apakah cukup ->kalau gacukup ga valid, hitung harga, simpan order, simpan order items, update order
import { Hono } from "hono";
import db from "../lib/db.js";
import { snap } from "../lib/midtrans.js";
import { orders, orderItems, products, payments } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const orderRoute = new Hono();

orderRoute.post("/", async(c) => {
    const body = await c.req.json();
    const { buyerId, sellerId, items, paymentMethod, deliveryMethod, deliveryAddress } = body;

    if (!items || items.length === 0)
        return c.json({error:"Choose minimum 1 product!"}, 400);
    if (deliveryMethod === "delivery" && !deliveryAddress) {
        return c.json({error: "Delivery requires location permission (lat, lng)"}, 400);
    }

    try {
        const result = await db.transaction(async (tx) => {
            let totalAmount =  0;

            for (const item of items) {
                const [product] = await tx
                .select()
                .from(products)
                .where(eq(products.id, item.productId));

                if (!product) throw new Error(`Product ${item.productId} not found!`);
                if (Number(product.quantity) < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.title}`);
                }

                await tx 
                .update(products)
                .set({quantity: sql`${product.quantity} - ${item.quantity}`})
                .where(eq(products.id, item.productId));

            totalAmount += Number(item.price)*item.quantity;
            }

            const [newOrder] = await tx
            .insert(orders)
            .values({
                buyerId,
                sellerId,
                totalAmount: String(totalAmount),
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
                status: "pending",
                paymentMethod: paymentMethod ?? null,
                createdAt: new Date(),
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
                snapRedirectUrl: transaction.redirect_url
            }; 
        });
        
        return c.json(result);

        } catch (err: any) {
            return c.json({error: err.message}, 400);
        }
    }
);
export default orderRoute;