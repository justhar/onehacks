import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  json,
  boolean,
} from "drizzle-orm/pg-core";

export const userTypeEnum = pgEnum("user_type", [
  "business",
  "pembeli",
  "charity",
]);
export const productTypeEnum = pgEnum("product_type", ["sell", "donation"]);
export const orderTypeEnum = pgEnum("order_type", ["sell", "donation"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "requested",
  "paid",
  "delivered",
  "ready",
  "completed",
  "cancelled",
  "expired",
  "denied",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "success",
  "failed",
]);

export const withDrawStatusEnum = pgEnum("withdraw_status", [
  "pending",
  "success",
  "failed",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "gopay",
  "ovo",
  "transfer",
]);

export const deliveryMethodEnum = pgEnum("delivery_method", [
  "delivery",
  "pickup",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  password: text("password").notNull(),
  userType: userTypeEnum("user_type").notNull(),
  isOnboardingCompleted: boolean("is_onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  businessEmail: varchar("business_email", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  mapNotes: text("map_notes"),
  paymentInfo: json("payment_info"), // Store payment details as JSON
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const charityProfiles = pgTable("charity_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  charityName: varchar("charity_name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }).notNull(),
  charityEmail: varchar("charity_email", { length: 255 }).notNull(),
  address: text("address").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => users.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  type: varchar("type", { length: 50 }).default("sell"), // Default to 'sell' for existing records
  imageUrl: text("image_url"),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  discount: numeric("discount", { precision: 5, scale: 2 }).default("0"),
  finalPrice: numeric("final_price", { precision: 10, scale: 2 }),
  expiryDate: timestamp("expiry_date"),
  quantity: integer("quantity").default(0),
  rating: numeric("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  buyerId: integer("buyer_id")
    .references(() => users.id)
    .notNull(),
  businessId: integer("business_id")
    .references(() => users.id)
    .notNull(),
  type: orderTypeEnum("order_type").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").default("pending"),
  deliveryMethod: deliveryMethodEnum("delivery_method").notNull(),
  deliveryAddress: text("delivery_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  quantity: integer("quantity").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .references(() => orders.id)
    .notNull(),
  status: paymentStatusEnum("status").default("pending"),
  paymentMethod: paymentMethodEnum("payment_method"),
  transactionId: varchar("transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdraw = pgTable("withdraws", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .references(() => businessProfiles.id)
    .notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(), // jumlah bayar
  destination: varchar("destination", { length: 255 }).notNull(),
  status: withDrawStatusEnum("status").default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }).unique(), // unik biar ga double
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
