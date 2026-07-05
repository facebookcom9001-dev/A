import { Router } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";
import { announcementsTable } from "@workspace/db";

const router = Router();

async function requireAdmin(req: any, res: any, next: any) {
  if (!req.authUser?.isAdmin) {
    res.status(403).json({ error: "الوصول مقتصر على المشرفين" });
    return;
  }
  next();
}

router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(rows.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/admin/users/:id/ban", requireAuth, requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const { isBanned } = req.body as { isBanned?: boolean };
  if (typeof isBanned !== "boolean") { res.status(400).json({ error: "isBanned مطلوب" }); return; }
  if (id === req.authUser.id) { res.status(400).json({ error: "لا يمكنك حظر نفسك" }); return; }
  try {
    const [user] = await db.update(usersTable).set({ isBanned }).where(eq(usersTable.id, id)).returning();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to update ban status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/announcements", async (req, res) => {
  try {
    const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
    res.json(rows.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Failed to get announcements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/admin/announcements", requireAuth, requireAdmin, async (req: any, res) => {
  const { title, body } = req.body as { title?: string; body?: string };
  if (!title?.trim() || !body?.trim()) {
    res.status(400).json({ error: "العنوان والمحتوى مطلوبان" });
    return;
  }
  try {
    const [ann] = await db.insert(announcementsTable).values({
      title: title.trim(),
      body: body.trim(),
      authorId: req.authUser.id,
    }).returning();
    res.status(201).json({ ...ann, createdAt: ann.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/announcements/:id", requireAuth, requireAdmin, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(announcementsTable).where(eq(announcementsTable.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
