import { Router } from "express";
import { db, usersTable, listingsTable } from "@workspace/db";
import { eq, desc, asc, ilike, gte, lte, and, sql } from "drizzle-orm";
import {
  GetListingsQueryParams,
  CreateListingBody,
  UpdateListingBody,
  UpdateListingParams,
  ContactSellerParams,
  ContactSellerBody,
} from "@workspace/api-zod";

const router = Router();

async function enrichListing(listing: typeof listingsTable.$inferSelect) {
  const [seller] = await db.select({ name: usersTable.name, university: usersTable.university })
    .from(usersTable).where(eq(usersTable.id, listing.sellerId));
  return {
    ...listing,
    price: parseFloat(listing.price),
    sellerName: seller?.name ?? "Unknown",
    sellerUniversity: seller?.university ?? "Unknown",
    createdAt: listing.createdAt.toISOString(),
  };
}

router.get("/listings", async (req, res) => {
  const parsed = GetListingsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, search, minPrice, maxPrice, sort } = parsed.data;
  const section = (req.query.section as string) || "marketplace";

  try {
    const conditions = [eq(listingsTable.section, section)];
    if (category) conditions.push(eq(listingsTable.category, category));
    if (search) conditions.push(ilike(listingsTable.title, `%${search}%`));
    if (minPrice !== undefined) conditions.push(gte(listingsTable.price, String(minPrice)));
    if (maxPrice !== undefined) conditions.push(lte(listingsTable.price, String(maxPrice)));

    let orderBy;
    if (sort === "price_asc") orderBy = asc(listingsTable.price);
    else if (sort === "price_desc") orderBy = desc(listingsTable.price);
    else if (sort === "popular") orderBy = desc(listingsTable.favoriteCount);
    else orderBy = desc(listingsTable.createdAt);

    const rows = conditions.length > 0
      ? await db.select().from(listingsTable).where(and(...conditions)).orderBy(orderBy)
      : await db.select().from(listingsTable).orderBy(orderBy);

    const sellers = await db.select({ id: usersTable.id, name: usersTable.name, university: usersTable.university }).from(usersTable);
    const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s]));

    res.json(rows.map(l => ({
      ...l,
      price: parseFloat(l.price),
      sellerName: sellerMap[l.sellerId]?.name ?? "Unknown",
      sellerUniversity: sellerMap[l.sellerId]?.university ?? "Unknown",
      createdAt: l.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listings", async (req, res) => {
  const parsed = CreateListingBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [listing] = await db.insert(listingsTable).values({
      ...parsed.data,
      price: String(parsed.data.price),
    }).returning();
    res.status(201).json(await enrichListing(listing));
  } catch (err) {
    req.log.error({ err }, "Failed to create listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/featured", async (req, res) => {
  try {
    const rows = await db.select().from(listingsTable)
      .where(eq(listingsTable.status, "available"))
      .orderBy(desc(listingsTable.favoriteCount))
      .limit(8);
    const sellers = await db.select({ id: usersTable.id, name: usersTable.name, university: usersTable.university }).from(usersTable);
    const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s]));
    res.json(rows.map(l => ({
      ...l,
      price: parseFloat(l.price),
      sellerName: sellerMap[l.sellerId]?.name ?? "Unknown",
      sellerUniversity: sellerMap[l.sellerId]?.university ?? "Unknown",
      createdAt: l.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get featured listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/recent", async (req, res) => {
  try {
    const rows = await db.select().from(listingsTable)
      .where(eq(listingsTable.status, "available"))
      .orderBy(desc(listingsTable.createdAt))
      .limit(8);
    const sellers = await db.select({ id: usersTable.id, name: usersTable.name, university: usersTable.university }).from(usersTable);
    const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s]));
    res.json(rows.map(l => ({
      ...l,
      price: parseFloat(l.price),
      sellerName: sellerMap[l.sellerId]?.name ?? "Unknown",
      sellerUniversity: sellerMap[l.sellerId]?.university ?? "Unknown",
      createdAt: l.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get recent listings");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/listings/:id", async (req, res) => {
  const parsed = UpdateListingParams.safeParse({ id: parseInt(req.params.id) });
  if (!parsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    const [listing] = await db.select().from(listingsTable).where(eq(listingsTable.id, parsed.data.id));
    if (!listing) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await enrichListing(listing));
  } catch (err) {
    req.log.error({ err }, "Failed to get listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/listings/:id", async (req, res) => {
  const paramsParsed = UpdateListingParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateListingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  try {
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.price !== undefined) updateData.price = String(parsed.data.price);
    const [listing] = await db.update(listingsTable).set(updateData).where(eq(listingsTable.id, paramsParsed.data.id)).returning();
    if (!listing) { res.status(404).json({ error: "Not found" }); return; }
    res.json(await enrichListing(listing));
  } catch (err) {
    req.log.error({ err }, "Failed to update listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/listings/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  try {
    await db.delete(listingsTable).where(eq(listingsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete listing");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/listings/:id/contact", async (req, res) => {
  const paramsParsed = ContactSellerParams.safeParse({ id: parseInt(req.params.id) });
  if (!paramsParsed.success) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = ContactSellerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  req.log.info({ listingId: paramsParsed.data.id, name: parsed.data.name }, "Contact seller request");
  res.json({ success: true });
});

export default router;
