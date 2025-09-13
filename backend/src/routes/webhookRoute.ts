import { Hono } from "hono";
import { eq } from "drizzle-orm";
import db from "../lib/db.js";
import { orders, payments } from "../db/schema.js";
import crypto from "crypto";

const webhookRoute = new Hono();

// Midtrans webhook endpoint
webhookRoute.post("/midtrans", async (c) => {
  try {
    const notification = await c.req.json();
    
    // Verify signature (recommended for production)
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const orderId = notification.order_id;
    const statusCode = notification.status_code;
    const grossAmount = notification.gross_amount;
    const signatureKey = notification.signature_key;
    
    // Create signature string
    const signatureString = orderId + statusCode + grossAmount + serverKey;
    const hash = crypto.createHash('sha512').update(signatureString).digest('hex');
    
    if (hash !== signatureKey) {
      console.log("Invalid signature");
      return c.json({ error: "Invalid signature" }, 400);
    }

    // Extract order ID from notification
    const orderIdFromNotification = orderId.replace('order-', '');
    
    // Update payment status based on transaction status
    let paymentStatus: "pending" | "success" | "failed" = 'pending';
    let orderStatus: "pending" | "paid" | "delivered" | "ready" | "completed" | "cancelled" = 'pending';
    
    switch (notification.transaction_status) {
      case 'capture':
      case 'settlement':
        if (notification.fraud_status === 'accept') {
          paymentStatus = 'success';
          orderStatus = 'paid';
        }
        break;
      case 'pending':
        paymentStatus = 'pending';
        orderStatus = 'pending';
        break;
      case 'deny':
      case 'cancel':
      case 'expire':
      case 'failure':
        paymentStatus = 'failed';
        orderStatus = 'cancelled';
        break;
    }

    // Update payment in database
    await db
      .update(payments)
      .set({
        status: paymentStatus,
        transactionId: notification.transaction_id,
      })
      .where(eq(payments.orderId, parseInt(orderIdFromNotification)));

    // Update order status
    await db
      .update(orders)
      .set({
        status: orderStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, parseInt(orderIdFromNotification)));

    console.log(`Payment updated for order ${orderIdFromNotification}: ${paymentStatus}`);
    
    return c.json({ status: 'success' });
  } catch (error) {
    console.error("Webhook error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get payment status endpoint
webhookRoute.get("/payment-status/:orderId", async (c) => {
  try {
    const { orderId } = c.req.param();
    
    const payment = await db
      .select()
      .from(payments)
      .where(eq(payments.orderId, parseInt(orderId)));
    
    if (payment.length === 0) {
      return c.json({ error: "Payment not found" }, 404);
    }
    
    return c.json(payment[0]);
  } catch (error) {
    console.error("Get payment status error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default webhookRoute;
