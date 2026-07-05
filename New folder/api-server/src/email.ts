import nodemailer from "nodemailer";

function createTransporter() {
  const user = process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  const transporter = createTransporter();
  if (!transporter) return false;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background:#f9f5f0; margin:0; padding:20px;">
  <div style="max-width:480px; margin:0 auto; background:#fff; border:3px solid #111; padding:32px;">
    <div style="background:#FF6B35; padding:16px; text-align:center; margin:-32px -32px 24px -32px; border-bottom:3px solid #111;">
      <h1 style="color:#fff; margin:0; font-size:24px; letter-spacing:1px;">Uni Shop</h1>
      <p style="color:#fff; margin:4px 0 0; font-size:13px;">سوق الطلاب الجامعي</p>
    </div>
    <p style="color:#111; font-size:16px; margin-bottom:8px;">مرحباً،</p>
    <p style="color:#444; font-size:15px; margin-bottom:24px;">
      رمز التحقق الخاص بك لتسجيل الدخول إلى <strong>Uni Shop</strong> هو:
    </p>
    <div style="background:#FAFF00; border:3px solid #111; padding:20px; text-align:center; margin-bottom:24px;">
      <span style="font-size:40px; font-weight:900; letter-spacing:12px; color:#111;">${code}</span>
    </div>
    <p style="color:#666; font-size:13px; border-top:2px solid #eee; padding-top:16px; margin:0;">
      هذا الرمز صالح لمدة <strong>10 دقائق</strong> فقط.<br>
      إذا لم تطلب هذا الرمز، تجاهل هذه الرسالة.
    </p>
  </div>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: `"Uni Shop" <${process.env.SMTP_EMAIL}>`,
      to,
      subject: `${code} — رمز تحقق Uni Shop`,
      html,
    });
    return true;
  } catch (err) {
    return false;
  }
}
