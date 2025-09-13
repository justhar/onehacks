import { Hono } from "hono";
import db from "../lib/db.js";
import { products, businessProfiles } from "../db/schema.js";
import { eq, sql, and } from "drizzle-orm";
import { getAuthUser } from "../lib/auth.js";

const productRoute = new Hono();

productRoute.post("/", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();

    const businessProfile = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, authUser.userId));

    if (businessProfile.length === 0) {
      return c.json({ error: "Business profile not found" }, 404);
    }

    const discount = body.discount || 0;
    const finalPrice = body.price - (body.price * discount) / 100;
    const productValues = {
      businessId: Number(authUser.userId),
      title: body.title,
      description: body.description,
      category: body.category,
      imageUrl: body.imageUrl,
      latitude: businessProfile[0].latitude,
      longitude: businessProfile[0].longitude,
      price: Number(body.price),
      discount,
      finalPrice,
      quantity: Number(body.quantity),
      type: body.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProduct = await db
      .insert(products)
      .values(productValues as any)
      .returning();

    return c.json(newProduct[0]); // Return the first inserted product
  } catch (error) {
    console.error("Product creation error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

productRoute.get("/", async (c) => {
  const type = c.req.query("type"); // Get type query parameter
  
  const baseQuery = db
    .select({
      id: products.id,
      businessId: products.businessId,
      title: products.title,
      description: products.description,
      category: products.category,
      type: products.type,
      imageUrl: products.imageUrl,
      latitude: products.latitude,
      longitude: products.longitude,
      price: products.price,
      discount: products.discount,
      finalPrice: products.finalPrice,
      expiryDate: products.expiryDate,
      quantity: products.quantity,
      rating: products.rating,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      businessName: businessProfiles.businessName,
    })
    .from(products)
    .leftJoin(
      businessProfiles,
      eq(products.businessId, businessProfiles.userId)
    );

  // Filter by type if provided
  let result;
  if (type && (type === "sell" || type === "donation")) {
    result = await baseQuery.where(eq(products.type, type));
  } else {
    result = await baseQuery;
  }

  return c.json(result);
});productRoute.get("/business/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const type = c.req.query("type"); // Get type query parameter

    // Build the base query
    const baseQuery = db
      .select({
        id: products.id,
        businessId: products.businessId,
        title: products.title,
        description: products.description,
        category: products.category,
        type: products.type,
        imageUrl: products.imageUrl,
        latitude: products.latitude,
        longitude: products.longitude,
        price: products.price,
        discount: products.discount,
        finalPrice: products.finalPrice,
        expiryDate: products.expiryDate,
        quantity: products.quantity,
        rating: products.rating,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        businessName: businessProfiles.businessName,
      })
      .from(products)
      .leftJoin(
        businessProfiles,
        eq(products.businessId, businessProfiles.userId)
      );

    // Apply where conditions based on type filter
    let result;
    if (type && (type === "sell" || type === "donation")) {
      result = await baseQuery.where(
        and(eq(products.businessId, Number(id)), eq(products.type, type))
      );
    } else {
      result = await baseQuery.where(eq(products.businessId, Number(id)));
    }

    return c.json(result);
  } catch (error) {
    console.error("Get products by business error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

productRoute.get("/product-nearby", async (c) => {
  const userLat = Number(c.req.query("lat"));
  const userLng = Number(c.req.query("lng"));

  if (isNaN(userLat) || isNaN(userLng)) {
    return c.json({ error: "Latitude and Longitude are required" }, 400);
  }

  const allProducts = await db
    .select({
      id: products.id,
      businessId: products.businessId,
      title: products.title,
      description: products.description,
      category: products.category,
      imageUrl: products.imageUrl,
      latitude: products.latitude,
      longitude: products.longitude,
      price: products.price,
      discount: products.discount,
      finalPrice: products.finalPrice,
      expiryDate: products.expiryDate,
      quantity: products.quantity,
      rating: products.rating,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      businessName: businessProfiles.businessName,
    })
    .from(products)
    .leftJoin(
      businessProfiles,
      eq(products.businessId, businessProfiles.userId)
    );

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; //radius bumi

  const withDistance = allProducts.map((p) => {
    if (!p.latitude || !p.longitude) return { ...p, distance: null };

    const prodLat = Number(p.latitude);
    const prodLng = Number(p.longitude);
    const dLat = toRad(prodLat - userLat);
    const dLng = toRad(prodLng - userLng);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(userLat)) *
        Math.cos(toRad(prodLat)) *
        Math.sin(dLng / 2) ** 2;

    const cAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * cAngle;

    return { ...p, distance };
  });

  withDistance.sort(
    (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
  );
  const radius = 1000;
  const nearbyProducts = withDistance.filter(
    (p) => p.distance !== null && p.distance <= radius
  );
  return c.json(nearbyProducts);
});

productRoute.get("/:id", async (c) => {
  const id = c.req.param("id");

  // Validate that id is a valid number
  if (!id || isNaN(Number(id))) {
    return c.json({ error: "Invalid product ID" }, 400);
  }

  const product = await db
    .select({
      id: products.id,
      businessId: products.businessId,
      title: products.title,
      description: products.description,
      category: products.category,
      imageUrl: products.imageUrl,
      latitude: products.latitude,
      longitude: products.longitude,
      price: products.price,
      discount: products.discount,
      finalPrice: products.finalPrice,
      expiryDate: products.expiryDate,
      quantity: products.quantity,
      rating: products.rating,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      businessName: businessProfiles.businessName,
    })
    .from(products)
    .leftJoin(
      businessProfiles,
      eq(products.businessId, businessProfiles.userId)
    )
    .where(eq(products.id, Number(id)));

  if (product.length === 0) {
    return c.json({ error: "Product not found" }, 404);
  }

  return c.json(product[0]);
});

productRoute.put("/:id", async (c) => {
  const id = c.req.param("id");

  // Validate that id is a valid number
  if (!id || isNaN(Number(id))) {
    return c.json({ error: "Invalid product ID" }, 400);
  }

  const body = await c.req.json();

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)));
  if (product.length === 0) return c.json({ error: "Product not found" }, 404);

  const current = product[0];
  const newPrice = body.price ?? current.price;
  const newDiscount = body.discount ?? current.discount;
  const finalPrice = newPrice - (newPrice * newDiscount) / 100;

  const [updated] = await db
    .update(products)
    .set({ ...body, finalPrice, updatedAt: new Date() })
    .where(eq(products.id, Number(id)))
    .returning();

  return c.json(updated);
});

productRoute.delete("/:id", async (c) => {
  const id = c.req.param("id");

  // Validate that id is a valid number
  if (!id || isNaN(Number(id))) {
    return c.json({ error: "Invalid product ID" }, 400);
  }

  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, Number(id)))
    .returning();

  if (!deleted) return c.json({ error: "Product not found" }, 404);
  return c.json({ success: true, message: "Product deleted" });
});

productRoute.post("/:id/decrease-stock", async (c) => {
  const id = c.req.param("id");

  // Validate that id is a valid number
  if (!id || isNaN(Number(id))) {
    return c.json({ error: "Invalid product ID" }, 400);
  }

  const { quantity } = await c.req.json();

  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, Number(id)));
  if (product.length === 0) return c.json({ error: "Product not found" }, 404);
  if ((product[0]?.quantity ?? 0) < quantity)
    return c.json({ error: "Not enough stock" }, 400);

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
