import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", ["business", "pembeli"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
