CREATE TABLE "business_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"business_name" varchar(255) NOT NULL,
	"contact_name" varchar(255) NOT NULL,
	"contact_phone" varchar(20) NOT NULL,
	"business_email" varchar(255) NOT NULL,
	"address" text NOT NULL,
	"latitude" varchar(50),
	"longitude" varchar(50),
	"map_notes" text,
	"opening_hours" json,
	"payment_info" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_onboarding_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "business_profiles" ADD CONSTRAINT "business_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;