<<<<<<< HEAD
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
=======
import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
>>>>>>> 2fb7421 (Saved progress at the end of the loop)
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().default(""),
  name: text("name").notNull().default(""),
  university: text("university").notNull().default(""),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
<<<<<<< HEAD
=======
  isAdmin: boolean("is_admin").notNull().default(false),
>>>>>>> 2fb7421 (Saved progress at the end of the loop)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
