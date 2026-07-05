import { pgTable, serial, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { listingsTable } from "./listings";

export const conversationsTable = pgTable("conversations", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listingsTable.id, { onDelete: "set null" }),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id, { onDelete: "cascade" }),
  senderId: integer("sender_id").notNull().references(() => usersTable.id),
  content: text("content").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Conversation = typeof conversationsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
