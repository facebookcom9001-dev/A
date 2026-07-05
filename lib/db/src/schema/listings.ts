import { pgTable, serial, text, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const listingsTable = pgTable("listings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull().default("0"),
  category: text("category").notNull().default(""),
  imageUrl: text("image_url"),
  sellerId: integer("seller_id").notNull().references(() => usersTable.id),
  status: text("status").notNull().default("available"),
  tags: text("tags"),
  favoriteCount: integer("favorite_count").notNull().default(0),
  section: text("section").notNull().default("marketplace"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertListingSchema = createInsertSchema(listingsTable).omit({ id: true, createdAt: true, favoriteCount: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listingsTable.$inferSelect;
