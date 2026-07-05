import { Router } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, countDistinct, sql } from "drizzle-orm";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    const [{ totalListings }] = await db.select({ totalListings: sql<number>`count(*)::int` }).from(listingsTable);
    const [{ totalUsers }] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(usersTable);
    const [{ totalCategories }] = await db.select({ totalCategories: countDistinct(listingsTable.category) }).from(listingsTable);
    const [{ totalSold }] = await db.select({ totalSold: sql<number>`count(*)::int` }).from(listingsTable).where(eq(listingsTable.status, "sold"));

    res.json({ totalListings, totalUsers, totalCategories, totalSold });
  } catch (err) {
    req.log.error({ err }, "Failed to get stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/categories/stats", async (req, res) => {
  try {
    const rows = await db.select({
      category: listingsTable.category,
      count: sql<number>`count(*)::int`,
    }).from(listingsTable).groupBy(listingsTable.category);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "Failed to get category stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
