import { Hono } from "hono";
import { eq } from "drizzle-orm";
import db from "../lib/db.js";
import { users } from "../db/schema.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
  getAuthUser,
} from "../lib/auth.js";

const auth = new Hono();

// Register endpoint
auth.post("/register", async (c) => {
  try {
    const { email, fullName, password, userType, address, latitude, longitude, mapNotes } = await c.req.json();

    // Validate required fields
    if (!email || !fullName || !password || !userType || !address) {
      return c.json({ error: "All fields are required" }, 400);
    }

    // Validate userType
    if (!["business", "pembeli"].includes(userType)) {
      return c.json(
        { error: 'User type must be either "business" or "pembeli"' },
        400
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        email,
        fullName,
        password: hashedPassword,
        userType: userType as "business" | "pembeli",
      })
      .returning();

    // Generate token
    const token = generateToken(newUser[0].id, newUser[0].email);

    return c.json({
      token,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        fullName: newUser[0].fullName,
        userType: newUser[0].userType,
        address: newUser[0].address,
        latitude: newUser[0].latitude,
        longitude: newUser[0].longitude,
        isOnboardingCompleted: newUser[0].isOnboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Login endpoint
auth.post("/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email));
    if (user.length === 0) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user[0].password);
    if (!isValidPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Generate token
    const token = generateToken(user[0].id, user[0].email);

    return c.json({
      token,
      user: {
        id: user[0].id,
        email: user[0].email,
        fullName: user[0].fullName,
        userType: user[0].userType,
        isOnboardingCompleted: user[0].isOnboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get current user endpoint
auth.get("/me", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, authUser.userId));
    if (user.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user[0].id,
        email: user[0].email,
        fullName: user[0].fullName,
        userType: user[0].userType,
        isOnboardingCompleted: user[0].isOnboardingCompleted,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default auth;
