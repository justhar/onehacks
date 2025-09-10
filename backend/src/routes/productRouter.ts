import { Hono } from "hono";
import db from "../lib/db.js";
import { products } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const productRoute = new Hono ();

productRoute.post("/", async (c) => {
    const body = await c.req.json();
    const discount = body.discount || 0,
    const finalPrice = body.price - (body.price*discount) / 100;

    const [newProduct] = await db.insert(products).values(body).returning();
    return c.json(newProduct);
});

productRoute.get("/", async () => {
    return db.select().from(products);
});

productRoute.get("/seller/:d", async (c) => {
    const { id } = c.req.param();
    return db.select().from(products).where(eq(products.sellerId, Number(id)));
});

productRoute.get("/:id", async (c) => {
    const { id } = c.req.param();
    const product = await db.select().from(products).where(eq(products.id, Number(id)));

    if (product.length === 0) {
        return c.json({error: "Product not found"}, 404);
    }

    return c.json(product[0]);
});

productRoute.put("/:id", async(c) => {
    const { id } = c.req.param();
    const body = await c.req.json();

    const product = await db.select().from(products).where(eq(products.id, Number(id)));
    if (product.length === 0) 
        return c.json({error:"Product not found"}, 404);

    const current = product[0];
    const newPrice = body.price ?? current.price;
    const newDiscount = body.discount ?? current.discount;
    const finalPrice = newPrice - (newPrice*newDiscount) / 100;

    const [updated] = await db
    .update(products)
    .set({...body, finalPrice, updatedAt: new Date()})
    .where(eq(products.id, Number(id)))
    .returning();

    return c.json(updated);
});

productRoute.delete("/:id", async (c) => {
    const { id } = c.req.param();
    const [deleted] = await db.delete(products).where(eq(products.id, Number(id))).returning();

    if (!deleted) return c.json({ error: "Product not found"}, 404);
    return c.json({ success: true, message: "Product deleted"});
});

productRoute.post("/:id/decrease-stock", async(c) => {
    const { id } = c.req.param();
    const { quantity } = await c.req.json();

    const product = await db.select().from(products).where(eq(products.id, Number(id)));
    if (product.length === 0 ) 
        return c.json({error: "Product not found"}, 404);
    if (product[0].quantity<quantity) 
        return c.json({error: "Not enough stock"}, 400);

    const [updated] = await db
    .update(products)
    .set({
        quantity: sql`${products.quantity} - ${quantity}`,
        updatedAt: new Date(),
    })
    .where(eq(products.id, Number(id)))
    .returning();

return c.json(updated);
});

export default productRouter