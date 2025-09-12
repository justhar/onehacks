import { Hono } from "hono";
import { eq } from "drizzle-orm";
import db from "../lib/db.js";
import { users, charityProfiles } from "../db/schema.js";
import { getAuthUser } from "../lib/auth.js";

const onboardingCharity = new Hono();

// Complete charity onboarding (All data in one request)
onboardingCharity.post("/charity/complete", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const {
      charityName,
      contactName,
      contactPhone,
      charityEmail,
      address,
      latitude,
      longitude,
    } = await c.req.json();

    // Validate required fields
    if (
      !charityName ||
      !contactName ||
      !contactPhone ||
      !charityEmail ||
      !address
    ) {
      return c.json({ error: "All required fields must be filled" }, 400);
    }

    // Check if charity profile already exists
    const existingProfile = await db
      .select()
      .from(charityProfiles)
      .where(eq(charityProfiles.userId, authUser.userId));

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(charityProfiles)
        .set({
          charityName,
          contactName,
          contactPhone,
          charityEmail,
          address,
          latitude: latitude?.toString(),
          longitude: longitude?.toString(),
          updatedAt: new Date(),
        })
        .where(eq(charityProfiles.userId, authUser.userId));
    } else {
      // Create new profile with all data
      await db.insert(charityProfiles).values({
        userId: authUser.userId,
        charityName,
        contactName,
        contactPhone,
        charityEmail,
        address,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
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
      message: "charity onboarding completed successfully",
    });
  } catch (error) {
    console.error("charity onboarding error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get charity profile
onboardingCharity.get("/charity/profile", async (c) => {
  try {
    const authUser = await getAuthUser(c);
    if (!authUser) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await db
      .select()
      .from(charityProfiles)
      .where(eq(charityProfiles.userId, authUser.userId));

    if (profile.length === 0) {
      return c.json({ profile: null });
    }

    return c.json({ profile: profile[0] });
  } catch (error) {
    console.error("Get charity profile error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default onboardingCharity;
