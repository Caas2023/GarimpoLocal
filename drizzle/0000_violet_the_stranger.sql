CREATE TABLE "categories" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "categories_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" integer PRIMARY KEY NOT NULL,
	"state" varchar(2) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "claims" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "claims_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"company_id" text NOT NULL,
	"claimer_email" varchar(255) NOT NULL,
	"claimer_name" varchar(255) NOT NULL,
	"claimer_phone" varchar(50),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"city_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"address" text,
	"phone" varchar(50),
	"website" varchar(255),
	"latitude" varchar(50),
	"longitude" varchar(50),
	"external_place_id" varchar(255),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "claims" ADD CONSTRAINT "claims_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;