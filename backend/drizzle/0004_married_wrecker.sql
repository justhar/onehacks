CREATE TYPE "public"."product_type" AS ENUM('sell', 'donation');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'requested' BEFORE 'paid';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'denied';--> statement-breakpoint
ALTER TYPE "public"."user_type" ADD VALUE 'charity';--> statement-breakpoint
CREATE TABLE "charity_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_phone" varchar(20) NOT NULL,
	"business_email" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"latitude" varchar(50),
	"longitude" varchar(50),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" RENAME COLUMN "seller_id" TO "business_id";--> statement-breakpoint
ALTER TABLE "products" RENAME COLUMN "seller_id" TO "business_id";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_seller_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_seller_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type" "product_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "latitude" varchar(50);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "longitude" varchar(50);--> statement-breakpoint
ALTER TABLE "charity_profiles" ADD CONSTRAINT "charity_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_users_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;