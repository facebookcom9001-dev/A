import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  authorId: integer("author_id").references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Announcement = typeof announcementsTable.$inferSelect;
