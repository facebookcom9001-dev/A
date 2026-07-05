import { Router } from "express";
import { randomInt } from "crypto";
import { db, otpCodesTable, sessionsTable, usersTable } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { sendOtpEmail } from "../email";

const router = Router();

function generateOtp(): string {
  return String(randomInt(100000, 999999));
}

function generateToken(): string {
  return Array.from(
    { length: 48 },
    () => "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[randomInt(62)]
  ).join("");
}

async function getUserFromToken(token: string) {
  const now = new Date();
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, now)));
  if (!session) return null;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
  return user ?? null;
}

export async function requireAuth(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "الجلسة منتهية أو غير صالحة" });
    return;
  }
  if (user.isBanned) {
    res.status(403).json({ error: "تم حظر هذا الحساب" });
    return;
  }
  req.authUser = user;
  req.authToken = token;
  next();
}

function isJordanianUniversityEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  const atIndex = lower.lastIndexOf("@");
  if (atIndex === -1) return false;
  const domain = lower.slice(atIndex + 1);
  return domain.endsWith(".edu.jo");
}

router.post("/auth/send-otp", async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email || !email.includes("@")) {
    res.status(400).json({ error: "البريد الإلكتروني غير صحيح" });
    return;
  }

  const emailLower = email.toLowerCase().trim();

  if (!isJordanianUniversityEmail(emailLower)) {
    res.status(400).json({ error: "يُقبل فقط البريد الجامعي الأردني الرسمي (ينتهي بـ .edu.jo)" });
    return;
  }
  const code = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await db.insert(otpCodesTable).values({ email: emailLower, code, expiresAt });

  const emailSent = await sendOtpEmail(emailLower, code);
  req.log.info({ email: emailLower, emailSent }, "OTP generated");

  res.json({
    success: true,
    emailSent,
    ...(emailSent ? {} : { devCode: code }),
  });
});

router.post("/auth/verify-otp", async (req, res) => {
  const { email, code } = req.body as { email?: string; code?: string };
  if (!email || !code) {
    res.status(400).json({ error: "البريد والرمز مطلوبان" });
    return;
  }

  const emailLower = email.toLowerCase().trim();
  const now = new Date();

  const [otp] = await db
    .select()
    .from(otpCodesTable)
    .where(
      and(
        eq(otpCodesTable.email, emailLower),
        eq(otpCodesTable.code, code),
        eq(otpCodesTable.used, false),
        gt(otpCodesTable.expiresAt, now)
      )
    )
    .orderBy(otpCodesTable.createdAt)
    .limit(1);

  if (!otp) {
    res.status(400).json({ error: "الرمز غير صحيح أو منتهي الصلاحية" });
    return;
  }

  await db.update(otpCodesTable).set({ used: true }).where(eq(otpCodesTable.id, otp.id));

  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, emailLower));

  if (!user) {
    const [created] = await db
      .insert(usersTable)
      .values({ email: emailLower, name: "", university: "" })
      .returning();
    user = created;
  }

  if (user.isBanned) {
    res.status(403).json({ error: "تم حظر هذا الحساب ولا يمكنه تسجيل الدخول" });
    return;
  }

  // Show profile setup if name or university is missing
  const needsProfileSetup = !user.name?.trim() || !user.university?.trim();

  const token = generateToken();
  const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(sessionsTable).values({ userId: user.id, token, expiresAt: tokenExpiresAt });

  res.json({ token, isNewUser: needsProfileSetup });
});

router.post("/auth/setup-profile", requireAuth, async (req: any, res) => {
  const { name, university, avatarUrl } = req.body as {
    name?: string;
    university?: string;
    avatarUrl?: string;
  };

  if (!name?.trim() || !university?.trim()) {
    res.status(400).json({ error: "الاسم والجامعة مطلوبان" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ name: name.trim(), university: university.trim(), avatarUrl: avatarUrl || null })
    .where(eq(usersTable.id, req.authUser.id))
    .returning();

  res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
});

router.get("/auth/me", async (req, res) => {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  const token = authHeader.slice(7);
  const user = await getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }
  res.json({ ...user, createdAt: user.createdAt.toISOString() });
});

router.post("/auth/logout", async (req, res) => {
  const authHeader = req.headers.authorization as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    await db.delete(sessionsTable).where(eq(sessionsTable.token, token)).catch(() => {});
  }
  res.json({ success: true });
});

export default router;
