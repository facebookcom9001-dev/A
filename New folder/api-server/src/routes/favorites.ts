import { Router } from "express";
import { db, usersTable, listingsTable, favoritesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { GetFavoritesQueryParams, ToggleFavoriteBody } from "@workspace/api-zod";

const router = Router();

router.get("/favorites", async (req, res) => {
  const parsed = GetFavoritesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { userId } = parsed.data;
  try {
    const favs = await db.select({ listingId: favoritesTable.listingId })
      .from(favoritesTable).where(eq(favoritesTable.userId, userId));
    if (favs.length === 0) { res.json([]); return; }

    const sellers = await db.select({ id: usersTable.id, name: usersTable.name, university: usersTable.university }).from(usersTable);
    const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s]));

    const allListings = [];
    for (const fav of favs) {
      const [l] = await db.select().from(listingsTable).where(eq(listingsTable.id, fav.listingId));
      if (l) allListings.push(l);
    }

    res.json(allListings.map(l => ({
      ...l,
      price: parseFloat(l.price),
      sellerName: sellerMap[l.sellerId]?.name ?? "Unknown",
      sellerUniversity: sellerMap[l.sellerId]?.university ?? "Unknown",
      createdAt: l.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get favorites");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/favorites/toggle", async (req, res) => {
  const parsed = ToggleFavoriteBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const { userId, listingId } = parsed.data;
  try {
    const [existing] = await db.select().from(favoritesTable)
      .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, listingId)));

    if (existing) {
      await db.delete(favoritesTable)
        .where(and(eq(favoritesTable.userId, userId), eq(favoritesTable.listingId, listingId)));
      await db.execute(`UPDATE listings SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = ${listingId}`);
      res.json({ favorited: false });
    } else {
      await db.insert(favoritesTable).values({ userId, listingId });
      await db.execute(`UPDATE listings SET favorite_count = favorite_count + 1 WHERE id = ${listingId}`);
      res.json({ favorited: true });
    }
  } catch (err) {
    req.log.error({ err }, "Failed to toggle favorite");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
