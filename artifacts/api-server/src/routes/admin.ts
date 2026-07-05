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
