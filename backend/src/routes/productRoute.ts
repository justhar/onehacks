import { Hono } from "hono";
import db from "../lib/db.js";
import { products } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const productRoute = new Hono ();

productRoute.post("/", async (c) => {
    const body = await c.req.json();
    const discount = body.discount || 0;
    const type = body.type || "sell";
    const basePrice = type === "donation" ? 0 : body.prices;
    const finalPrice = type === "donation"? 0: basePrice - (basePrice*discount) / 100;

    const [newProduct] = await db.insert(products).values({
        ...body,
        discount: type === "donation" ? null : discount,
        finalPrice,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
    .returning();
    return c.json(newProduct);
});


productRoute.get("/", async (c) => {
    const result = await db.select().from(products);
    return c.json(result);
});

productRoute.get("/business/:id", async (c) => {
  const id  = c.req.param("id");
  const result = await db.select().from(products).where(eq(products.businessId, Number(id)));
  return c.json(result);
});

productRoute.get("/:id", async (c) => {
    const { id } = c.req.param();
    const product = await db.select().from(products).where(eq(products.id, Number(id)));

    if (product.length === 0) {
        return c.json({error: "Product not found"}, 404);
    }

    return c.json(product[0]);
});

productRoute.get("/product-nearby", async (c) => {
    const userLat = Number(c.req.query("lat"));
    const userLng = Number (c.req.query("lng"));

    if (isNaN(userLat)|| isNaN(userLng)) {
        return c.json({error: "Latitude and Longitude are required"}, 400);
    }

    const allProducts = await db.select().from(products);

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; //radius bumi

    const withDistance = allProducts.map((p)=> {
        if (!p.latitude || !p.longitude) return {...p, distance: null};

        const prodLat = Number(p.latitude);
        const prodLng = Number(p.longitude);
        const dLat = toRad(prodLat - userLat);
        const dLng = toRad(prodLng - userLng);

        const a = Math.sin(dLat/2)**2 +
                  Math.cos(toRad(userLat)) * Math.cos(toRad(prodLat)) *
                  Math.sin(dLng/2)**2;

        const cAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * cAngle;

        return {...p, distance};
});

    withDistance.sort((a,b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    const radius = Number(c.req.query("radius") || 1);
    const nearbyProducts = withDistance.filter( p => p.distance !== null && p.distance <= radius);
    return c.json(nearbyProducts)
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
    if ((product[0]?.quantity??0)<quantity) 
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

export default productRoute;