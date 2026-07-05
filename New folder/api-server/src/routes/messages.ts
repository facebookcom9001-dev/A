import { Router } from "express";
import { db, conversationsTable, messagesTable, usersTable, listingsTable } from "@workspace/db";
import { eq, or, and, desc, sql, inArray } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.post("/messages/start", requireAuth, async (req: any, res) => {
  const me = req.authUser;
  const { receiverId, listingId, message } = req.body as {
    receiverId?: number;
    listingId?: number;
    message?: string;
  };

  if (!receiverId || !message?.trim()) {
    res.status(400).json({ error: "المستلم والرسالة مطلوبان" });
    return;
  }

  if (receiverId === me.id) {
    res.status(400).json({ error: "لا يمكن مراسلة نفسك" });
    return;
  }

  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, receiverId));
  if (!receiver) {
    res.status(404).json({ error: "المستخدم غير موجود" });
    return;
  }

  let [existing] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        listingId
          ? eq(conversationsTable.listingId, listingId)
          : sql`${conversationsTable.listingId} IS NULL`,
        or(
          and(eq(conversationsTable.senderId, me.id), eq(conversationsTable.receiverId, receiverId)),
          and(eq(conversationsTable.senderId, receiverId), eq(conversationsTable.receiverId, me.id))
        )
      )
    )
    .limit(1);

  if (!existing) {
    const [created] = await db
      .insert(conversationsTable)
      .values({
        senderId: me.id,
        receiverId,
        listingId: listingId ?? null,
      })
      .returning();
    existing = created;
  }

  await db.insert(messagesTable).values({
    conversationId: existing.id,
    senderId: me.id,
    content: message.trim(),
  });

  await db
    .update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, existing.id));

  res.json({ conversationId: existing.id });
});

router.get("/messages/conversations", requireAuth, async (req: any, res) => {
  const me = req.authUser;

  const convs = await db
    .select()
    .from(conversationsTable)
    .where(or(eq(conversationsTable.senderId, me.id), eq(conversationsTable.receiverId, me.id)))
    .orderBy(desc(conversationsTable.updatedAt));

  const userIds = [...new Set(convs.flatMap(c => [c.senderId, c.receiverId]))];
  const listingIds = [...new Set(convs.map(c => c.listingId).filter(Boolean))] as number[];

  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(inArray(usersTable.id, userIds))
    : [];
  const listings = listingIds.length > 0
    ? await db.select().from(listingsTable).where(inArray(listingsTable.id, listingIds))
    : [];

  const userMap = Object.fromEntries(users.map(u => [u.id, u]));
  const listingMap = Object.fromEntries(listings.map(l => [l.id, l]));

  const result = await Promise.all(
    convs.map(async (c) => {
      const [lastMsg] = await db
        .select()
        .from(messagesTable)
        .where(eq(messagesTable.conversationId, c.id))
        .orderBy(desc(messagesTable.createdAt))
        .limit(1);

      const [unreadCount] = await db
        .select({ count: sql<number>`count(*)` })
        .from(messagesTable)
        .where(
          and(
            eq(messagesTable.conversationId, c.id),
            eq(messagesTable.isRead, false),
            sql`${messagesTable.senderId} != ${me.id}`
          )
        );

      const otherId = c.senderId === me.id ? c.receiverId : c.senderId;
      const other = userMap[otherId];
      const listing = c.listingId ? listingMap[c.listingId] : null;

      return {
        id: c.id,
        otherUser: other ? { id: other.id, name: other.name, university: other.university, avatarUrl: other.avatarUrl } : null,
        listing: listing ? { id: listing.id, title: listing.title, section: listing.section } : null,
        lastMessage: lastMsg ? { content: lastMsg.content, createdAt: lastMsg.createdAt.toISOString(), isMine: lastMsg.senderId === me.id } : null,
        unreadCount: Number(unreadCount?.count ?? 0),
        updatedAt: c.updatedAt.toISOString(),
      };
    })
  );

  res.json(result);
});

router.get("/messages/conversations/:id", requireAuth, async (req: any, res) => {
  const me = req.authUser;
  const convId = parseInt(req.params.id);

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, convId),
        or(eq(conversationsTable.senderId, me.id), eq(conversationsTable.receiverId, me.id))
      )
    );

  if (!conv) {
    res.status(404).json({ error: "المحادثة غير موجودة" });
    return;
  }

  await db
    .update(messagesTable)
    .set({ isRead: true })
    .where(
      and(
        eq(messagesTable.conversationId, convId),
        sql`${messagesTable.senderId} != ${me.id}`
      )
    );

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(messagesTable.createdAt);

  const otherId = conv.senderId === me.id ? conv.receiverId : conv.senderId;
  const [other] = await db.select().from(usersTable).where(eq(usersTable.id, otherId));
  const listing = conv.listingId
    ? (await db.select().from(listingsTable).where(eq(listingsTable.id, conv.listingId)))[0]
    : null;

  res.json({
    id: conv.id,
    otherUser: other ? { id: other.id, name: other.name, university: other.university, avatarUrl: other.avatarUrl } : null,
    listing: listing ? { id: listing.id, title: listing.title, section: listing.section } : null,
    messages: msgs.map(m => ({
      id: m.id,
      content: m.content,
      isMine: m.senderId === me.id,
      isRead: m.isRead,
      createdAt: m.createdAt.toISOString(),
    })),
  });
});

router.post("/messages/conversations/:id/send", requireAuth, async (req: any, res) => {
  const me = req.authUser;
  const convId = parseInt(req.params.id);
  const { content } = req.body as { content?: string };

  if (!content?.trim()) {
    res.status(400).json({ error: "الرسالة لا يمكن أن تكون فارغة" });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversationsTable)
    .where(
      and(
        eq(conversationsTable.id, convId),
        or(eq(conversationsTable.senderId, me.id), eq(conversationsTable.receiverId, me.id))
      )
    );

  if (!conv) {
    res.status(404).json({ error: "المحادثة غير موجودة" });
    return;
  }

  const [msg] = await db
    .insert(messagesTable)
    .values({ conversationId: convId, senderId: me.id, content: content.trim() })
    .returning();

  await db
    .update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, convId));

  res.json({ id: msg.id, content: msg.content, isMine: true, isRead: false, createdAt: msg.createdAt.toISOString() });
});

export default router;
