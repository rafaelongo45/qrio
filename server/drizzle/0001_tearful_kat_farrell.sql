CREATE TABLE "dynamic_qrs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"short_code" varchar(20) NOT NULL,
	"redirect_url" varchar(2048) NOT NULL,
	"label" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dynamic_qrs_short_code_unique" UNIQUE("short_code")
);
--> statement-breakpoint
CREATE TABLE "scan_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"qr_id" uuid NOT NULL,
	"scanned_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" varchar(512)
);
--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "fg_color" varchar(7);--> statement-breakpoint
ALTER TABLE "qr_codes" ADD COLUMN "bg_color" varchar(7);--> statement-breakpoint
ALTER TABLE "dynamic_qrs" ADD CONSTRAINT "dynamic_qrs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scan_logs" ADD CONSTRAINT "scan_logs_qr_id_dynamic_qrs_id_fk" FOREIGN KEY ("qr_id") REFERENCES "public"."dynamic_qrs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dynamic_qrs_user_id_idx" ON "dynamic_qrs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "dynamic_qrs_short_code_idx" ON "dynamic_qrs" USING btree ("short_code");--> statement-breakpoint
CREATE INDEX "scan_logs_qr_id_idx" ON "scan_logs" USING btree ("qr_id");