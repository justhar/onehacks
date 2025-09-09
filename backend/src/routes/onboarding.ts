import { Hono } from "hono";
import { eq } from "drizzle-orm";
import db from "../lib/db.js";
import { users, businessProfiles } from "../db/schema.js";
import { getAuthUser } from "../lib/auth.js";

const onboarding = new Hono();

// Complete business onboarding (All data in one request)
onboarding.post("/business/complete", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      businessName,
      contactName,
      contactPhone,
      businessEmail,
      address,
      latitude,
      longitude,
      mapNotes,
      paymentInfo,
    } = await c.req.json();

    // Validate required fields
    if (
      !businessName ||
      !contactName ||
      !contactPhone ||
      !businessEmail ||
      !address
    ) {
      return c.json({ error: "All required fields must be filled" }, 400);
    }

    // Check if business profile already exists
    const existingProfile = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, authUser.userId));

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(businessProfiles)
        .set({
          businessName,
          contactName,
          contactPhone,
          businessEmail,
          address,
          latitude: latitude?.toString(),
          longitude: longitude?.toString(),
          mapNotes,
          paymentInfo,
          updatedAt: new Date(),
        })
        .where(eq(businessProfiles.userId, authUser.userId));
    } else {
      // Create new profile with all data
      await db.insert(businessProfiles).values({
        userId: authUser.userId,
        businessName,
        contactName,
        contactPhone,
        businessEmail,
        address,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
        mapNotes,
        paymentInfo,
      });
    }

    // Mark user as onboarding completed
    await db
      .update(users)
      .set({
        isOnboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, authUser.userId));

    return c.json({
      success: true,
      message: "Business onboarding completed successfully",
    });
  } catch (error) {
    console.error("Business onboarding error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get business profile
onboarding.get("/business/profile", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await db
      .select()
      .from(businessProfiles)
      .where(eq(businessProfiles.userId, authUser.userId));

    if (profile.length === 0) {
      return c.json({ profile: null });
    }

    return c.json({ profile: profile[0] });
  } catch (error) {
    console.error("Get business profile error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default onboarding;
