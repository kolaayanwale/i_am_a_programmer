CREATE TABLE "notification_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" serial NOT NULL,
	"channel" varchar NOT NULL,
	"status" varchar NOT NULL,
	"sent_at" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notification_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "prayer_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"relationship" varchar,
	"email" varchar,
	"phone" varchar,
	"birthday" date,
	"date_of_death" date,
	"profile_image_url" varchar,
	"status" varchar DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"subject_id" serial NOT NULL,
	"notification_type_id" serial NOT NULL,
	"frequency" varchar NOT NULL,
	"channels" text[],
	"is_active" boolean DEFAULT true NOT NULL,
	"next_notification_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tributes" (
	"id" serial PRIMARY KEY NOT NULL,
	"subject_id" serial NOT NULL,
	"message" text NOT NULL,
	"author_name" varchar NOT NULL,
	"author_email" varchar,
	"is_anonymous" boolean DEFAULT false,
	"is_approved" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");