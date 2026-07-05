import { Router } from "express";
import { db, usersTable, listingsTable, favoritesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateUserBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
    res.json(users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  const parsed = CreateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [user] = await db.insert(usersTable).values(parsed.data).returning();
    res.status(201).json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to create user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    res.json({ ...user, createdAt: user.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Failed to get user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:id/listings", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "Not found" }); return; }
    const rows = await db.select().from(listingsTable).where(eq(listingsTable.sellerId, id)).orderBy(desc(listingsTable.createdAt));
    res.json(rows.map(l => ({
      ...l,
      price: parseFloat(l.price),
      sellerName: user.name,
      sellerUniversity: user.university,
      createdAt: l.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get user listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
