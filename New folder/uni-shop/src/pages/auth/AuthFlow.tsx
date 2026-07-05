import { useState } from "react";
import { ShoppingBag, Mail, KeyRound, User, Building2, ArrowLeft, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { JORDANIAN_UNIVERSITIES } from "@/lib/constants";

function isValidUniEmail(email: string): boolean {
  if (!email.includes("@")) return false;
  const domain = email.toLowerCase().split("@").pop() ?? "";
  return domain.endsWith(".edu.jo") && domain.length > ".edu.jo".length;
}

type Step = "email" | "otp" | "profile";

export default function AuthFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [emailSent, setEmailSent] = useState(false);
  const [name, setName] = useState("");
  const [university, setUniversity] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const { sendOtp, verifyOtp, setupProfile } = useAuth();
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await sendOtp(email.trim());
      setDevCode(res.devCode);
      setEmailSent(res.emailSent ?? false);
      setStep("otp");
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    try {
      const { isNewUser } = await verifyOtp(email.trim(), otp.trim());
      if (isNewUser) {
        setStep("profile");
      }
    } catch (err: any) {
      toast({ title: "رمز خاطئ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSetupProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !university) return;
    setLoading(true);
    try {
      await setupProfile({ name: name.trim(), university, avatarUrl: avatarUrl.trim() || undefined });
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b-4 border-black bg-primary p-4 flex items-center justify-center gap-3">
        <div className="bg-white text-primary p-2 border-2 border-black">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <span className="text-2xl font-black text-white tracking-tight font-display">Uni Shop</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-10">
            {(["email", "otp", "profile"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 border-2 border-black flex items-center justify-center font-black text-sm neo-shadow transition-colors ${
                  step === s ? "bg-primary text-white" :
                  (["email", "otp", "profile"].indexOf(step) > i) ? "bg-accent text-black" : "bg-white text-black"
                }`}>
                  {["email", "otp", "profile"].indexOf(step) > i ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                {i < 2 && <div className="w-8 h-0.5 bg-black opacity-30" />}
              </div>
            ))}
          </div>

          {/* Email Step */}
          {step === "email" && (
            <div className="bg-card border-4 border-black neo-shadow p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary p-2 border-2 border-black">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black font-display">أدخل بريدك الجامعي</h1>
                  <p className="text-sm text-muted-foreground font-bold">سنرسل لك رمز تحقق</p>
                </div>
              </div>
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-muted-foreground block mb-2">البريد الإلكتروني الجامعي</label>
                  <Input
                    type="text"
                    inputMode="email"
                    placeholder="student@university.edu.jo"
                    value={email}
                    onChange={e => setEmail(e.target.value.trim())}
                    className={`border-2 border-black rounded-none neo-shadow h-12 text-base font-bold font-mono ${
                      email && !isValidUniEmail(email) ? "border-destructive" : ""
                    }`}
                    dir="ltr"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                  />
                  {email && !isValidUniEmail(email) ? (
                    <p className="text-xs text-destructive mt-2 font-black">
                      يجب أن ينتهي الإيميل بـ .edu.jo — مثال: {email.includes("@") ? email.split("@")[0] : "student"}@university.edu.jo
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground mt-2 font-medium">
                      يُقبل فقط البريد الجامعي الأردني الرسمي (ينتهي بـ .edu.jo)
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading || !isValidUniEmail(email)}
                  className="w-full h-12 border-2 border-black rounded-none neo-shadow font-black text-base"
                >
                  {loading ? "جاري الإرسال..." : "أرسل رمز التحقق"}
                </Button>
              </form>
            </div>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <div className="bg-card border-4 border-black neo-shadow p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary p-2 border-2 border-black">
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black font-display">أدخل رمز التحقق</h1>
                  <p className="text-sm text-muted-foreground font-bold">تحقق من بريدك الإلكتروني</p>
                </div>
              </div>

              {devCode && (
                <div className="bg-accent border-2 border-black p-4 mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    <KeyRound className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm font-black text-black">رمز التحقق الخاص بك:</p>
                  </div>
                  <p className="text-4xl font-black tracking-[0.4em] text-black text-center py-2 border-2 border-black bg-white">{devCode}</p>
                  <p className="text-xs font-bold text-black/70 mt-3 text-center">
                    {emailSent
                      ? "أُرسل إيميل أيضاً — إذا لم يصلك (بعض جامعات تحجب Gmail) استخدم الرمز أعلاه مباشرة"
                      : "استخدم هذا الرمز لتسجيل الدخول"}
                  </p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-muted-foreground block mb-2">الرمز المكون من 6 أرقام</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="border-2 border-black rounded-none neo-shadow h-14 text-3xl font-black text-center tracking-[0.3em]"
                    dir="ltr"
                    maxLength={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    تم إرساله إلى: <span className="font-black text-foreground" dir="ltr">{email}</span>
                    <br />الرمز صالح لمدة 10 دقائق
                  </p>
                </div>
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-12 border-2 border-black rounded-none neo-shadow font-black text-base bg-secondary hover:bg-secondary/90 text-white"
                >
                  {loading ? "جاري التحقق..." : "تحقق من الرمز"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(""); setDevCode(undefined); setEmailSent(false); }}
                  className="w-full text-sm font-bold text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" /> تغيير البريد الإلكتروني
                </button>
              </form>
            </div>
          )}

          {/* Profile Setup Step */}
          {step === "profile" && (
            <div className="bg-card border-4 border-black neo-shadow p-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-accent border-2 border-black p-2">
                  <User className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h1 className="text-2xl font-black font-display">أكمل ملفك الشخصي</h1>
                  <p className="text-sm text-muted-foreground font-bold">خطوة أخيرة وتبدأ!</p>
                </div>
              </div>

              <div className="bg-primary/10 border-2 border-black p-3 mb-6 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-sm font-bold">تم التحقق من بريدك بنجاح</p>
              </div>

              <form onSubmit={handleSetupProfile} className="space-y-5">
                <div>
                  <label className="text-xs font-black text-muted-foreground block mb-2">الاسم الكامل *</label>
                  <Input
                    placeholder="اكتب اسمك هنا"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="border-2 border-black rounded-none neo-shadow h-12 text-base font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-muted-foreground block mb-2 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" /> الجامعة *
                  </label>
                  <Select onValueChange={setUniversity}>
                    <SelectTrigger className="border-2 border-black rounded-none neo-shadow h-12 font-bold">
                      <SelectValue placeholder="اختر جامعتك" />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black rounded-none max-h-64">
                      {JORDANIAN_UNIVERSITIES.map(uni => (
                        <SelectItem key={uni} value={uni} className="font-bold cursor-pointer">{uni}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-xs font-black text-muted-foreground block mb-2">رابط الصورة الشخصية (اختياري)</label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={avatarUrl}
                    onChange={e => setAvatarUrl(e.target.value)}
                    className="border-2 border-black rounded-none neo-shadow h-12"
                    dir="ltr"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !name.trim() || !university}
                  className="w-full h-14 border-2 border-black rounded-none neo-shadow font-black text-lg bg-accent text-black hover:bg-accent/90 border-black"
                >
                  {loading ? "جاري الحفظ..." : "ابدأ التسوق"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
