import { useState as useReactState, useRef } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { MARKETPLACE_CATEGORIES, SECTIONS, JOB_TYPES, ROOM_GENDER, LOST_FOUND_STATUS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Image as ImageIcon, Tag, Briefcase, Home, Rocket, Search, Handshake, ShoppingBag, Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";

const TOKEN_KEY = "uni_shop_token";
function getToken() { return localStorage.getItem(TOKEN_KEY); }

async function createListing(data: Record<string, unknown>) {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch("/api/listings", { method: "POST", headers, body: JSON.stringify(data) });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "خطأ" }));
    throw new Error(err.error || "خطأ في النشر");
  }
  return res.json();
}

const sectionMeta: Record<string, {
  icon: React.ReactNode;
  label: string;
  titlePlaceholder: string;
  descPlaceholder: string;
  showPrice: boolean;
  priceLabel: string;
  categories?: { value: string; label?: string }[];
  categoryLabel?: string;
}> = {
  marketplace: {
    icon: <ShoppingBag className="w-6 h-6 text-white" />,
    label: "السوق",
    titlePlaceholder: "مثل: كتاب علوم حاسوب بحالة ممتازة",
    descPlaceholder: "صف حالة المنتج ومميزاته...",
    showPrice: true,
    priceLabel: "السعر (دينار أردني)",
    categories: MARKETPLACE_CATEGORIES.map(c => ({ value: c.value })),
    categoryLabel: "الفئة",
  },
  jobs: {
    icon: <Briefcase className="w-6 h-6 text-white" />,
    label: "فرص عمل",
    titlePlaceholder: "مثل: مساعد مبرمج في شركة ناشئة",
    descPlaceholder: "صف المتطلبات والمزايا وطريقة التقديم...",
    showPrice: true,
    priceLabel: "الراتب الشهري (دينار أردني، 0 إذا غير محدد)",
    categories: JOB_TYPES.map(t => ({ value: t })),
    categoryLabel: "نوع الوظيفة",
  },
  roommates: {
    icon: <Home className="w-6 h-6 text-white" />,
    label: "شريك سكن",
    titlePlaceholder: "مثل: غرفة متاحة قرب جامعة الأردن",
    descPlaceholder: "صف الموقع، المرافق، وشروط السكن...",
    showPrice: true,
    priceLabel: "الإيجار الشهري (دينار أردني)",
    categories: ROOM_GENDER.map(g => ({ value: g })),
    categoryLabel: "الجنس المطلوب",
  },
  startups: {
    icon: <Rocket className="w-6 h-6 text-black" />,
    label: "Startup Hub",
    titlePlaceholder: "مثل: تطبيق لتوصيل وجبات داخل الحرم الجامعي",
    descPlaceholder: "صف فكرتك، المشكلة التي تحلها، وما تحتاجه...",
    showPrice: true,
    priceLabel: "الاستثمار المطلوب (دينار أردني، 0 إذا لا يوجد)",
    categories: ["فكرة", "نموذج أولي", "إطلاق", "نمو", "استثمار مطلوب"].map(s => ({ value: s })),
    categoryLabel: "مرحلة المشروع",
  },
  lost_found: {
    icon: <Search className="w-6 h-6 text-white" />,
    label: "مفقودات",
    titlePlaceholder: "مثل: محفظة سوداء قرب مبنى الهندسة",
    descPlaceholder: "صف الشيء بالتفصيل، مكان وتاريخ الفقدان/الإيجاد...",
    showPrice: false,
    priceLabel: "",
    categories: LOST_FOUND_STATUS.map(s => ({ value: s.value, label: s.label })),
    categoryLabel: "الحالة",
  },
  borrow: {
    icon: <Handshake className="w-6 h-6 text-white" />,
    label: "Borrow Hub",
    titlePlaceholder: "مثل: آلة حاسبة علمية متاحة للاستعارة",
    descPlaceholder: "صف الشيء وحالته وشروط الاستعارة...",
    showPrice: true,
    priceLabel: "رسوم الاستعارة اليومية (0 إذا مجاني)",
    categories: ["كتب", "أدوات", "إلكترونيات", "ملابس", "معدات رياضية", "أخرى"].map(c => ({ value: c })),
    categoryLabel: "الفئة",
  },
};

export default function Sell() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialSection = params.get("section") || "marketplace";

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [section, setSectionState] = useReactState(initialSection);
  const [title, setTitle] = useReactState("");
  const [description, setDesc] = useReactState("");
  const [price, setPrice] = useReactState("0");
  const [category, setCategory] = useReactState("");
  const [imageUrl, setImageUrl] = useReactState("");
  const [tags, setTags] = useReactState("");
  const [submitting, setSubmitting] = useReactState(false);
  const [imageMode, setImageMode] = useReactState<"url" | "upload">("url");
  const [uploading, setUploading] = useReactState(false);
  const [uploadedPreview, setUploadedPreview] = useReactState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "خطأ", description: "يرجى اختيار صورة فقط", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "خطأ", description: "حجم الصورة يجب أن يكون أقل من 5MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const token = getToken();
      const urlRes = await fetch("/api/storage/uploads/request-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("فشل الحصول على رابط الرفع");
      const { uploadURL, objectPath } = await urlRes.json() as { uploadURL: string; objectPath: string };

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("فشل رفع الصورة");

      const servingUrl = `/api/storage${objectPath}`;
      setImageUrl(servingUrl);
      setUploadedPreview(URL.createObjectURL(file));
      toast({ title: "تم رفع الصورة!", description: "الصورة جاهزة" });
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const meta = sectionMeta[section] ?? sectionMeta.marketplace;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast({ title: "تنبيه", description: "العنوان والوصف مطلوبان", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const data = await createListing({
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        category: category || (meta.categories?.[0]?.value ?? ""),
        imageUrl: imageUrl.trim() || undefined,
        sellerId: user?.id ?? 0,
        tags: tags.trim() || undefined,
        section,
        status: "available",
      });
      toast({
        title: "تم النشر!",
        description: "إعلانك الآن متاح.",
        className: "bg-accent text-black border-4 border-black rounded-none neo-shadow font-bold",
      });
      const sectionObj = SECTIONS.find(s => s.value === section);
      setLocation(sectionObj && section !== "marketplace" ? sectionObj.path : `/listings/${data.id}`);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const bgColor = section === "startups" ? "bg-accent" : section === "lost_found" ? "bg-destructive" : "bg-primary";

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-display font-black mb-2">أضف إعلان جديد</h1>
        <p className="text-muted-foreground font-bold">اختر القسم المناسب لإعلانك</p>
      </div>

      {/* Section selector */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-8">
        {SECTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => { setSectionState(s.value); setCategory(""); }}
            className={`flex flex-col items-center gap-1 p-3 border-2 border-black font-bold text-xs text-center transition-all ${section === s.value ? "bg-primary text-white neo-shadow" : "bg-white hover:bg-accent/20"}`}
          >
            <span className="text-xl">{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="bg-card border-4 border-black p-6 md:p-10 neo-shadow">
        <div className={`flex items-center gap-3 mb-8 p-4 border-2 border-black ${bgColor}`}>
          {meta.icon}
          <div>
            <h2 className={`font-black text-lg ${section === "startups" ? "text-black" : "text-white"}`}>{meta.label}</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-black mb-2">العنوان *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={meta.titlePlaceholder}
              className="border-2 border-black rounded-none neo-shadow text-base h-12"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-black mb-2">الوصف *</label>
            <Textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              placeholder={meta.descPlaceholder}
              className="border-2 border-black rounded-none neo-shadow min-h-[140px] resize-none text-base"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {meta.showPrice && (
              <div>
                <label className="block text-sm font-black mb-2">{meta.priceLabel}</label>
                <div className="relative">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">JD</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.001"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="pr-12 border-2 border-black rounded-none neo-shadow h-12 font-black"
                  />
                </div>
              </div>
            )}

            {meta.categories && meta.categories.length > 0 && (
              <div>
                <label className="block text-sm font-black mb-2">{meta.categoryLabel}</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-2 border-black rounded-none neo-shadow h-12 font-bold">
                    <SelectValue placeholder={`اختر ${meta.categoryLabel}`} />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none">
                    {meta.categories.map(c => (
                      <SelectItem key={c.value} value={c.value} className="font-bold">
                        {c.label ?? c.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="pt-4 border-t-2 border-dashed border-black space-y-4">
            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> صورة الإعلان (اختياري)
              </label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm transition-colors ${imageMode === "url" ? "bg-primary text-white" : "bg-white hover:bg-accent/20"}`}
                >
                  <LinkIcon className="w-4 h-4" /> رابط URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-black font-bold text-sm transition-colors ${imageMode === "upload" ? "bg-primary text-white" : "bg-white hover:bg-accent/20"}`}
                >
                  <Upload className="w-4 h-4" /> رفع من جهازك
                </button>
              </div>

              {imageMode === "url" ? (
                <Input
                  value={imageUrl}
                  onChange={e => { setImageUrl(e.target.value); setUploadedPreview(null); }}
                  placeholder="https://..."
                  className="border-2 border-black rounded-none neo-shadow h-12"
                  dir="ltr"
                />
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                  />
                  {uploadedPreview ? (
                    <div className="relative inline-block">
                      <img src={uploadedPreview} alt="preview" className="h-32 border-4 border-black object-cover" />
                      <button
                        type="button"
                        onClick={() => { setUploadedPreview(null); setImageUrl(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="absolute -top-2 -right-2 bg-destructive text-white border-2 border-black p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full h-32 border-4 border-dashed border-black flex flex-col items-center justify-center gap-2 hover:bg-accent/20 transition-colors font-bold text-muted-foreground"
                    >
                      {uploading ? (
                        <><Loader2 className="w-8 h-8 animate-spin" /><span>جاري الرفع...</span></>
                      ) : (
                        <><Upload className="w-8 h-8" /><span>اضغط لاختيار صورة</span><span className="text-xs">PNG, JPG, WEBP — حتى 5MB</span></>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" /> وسوم (مفصولة بفاصلة)
              </label>
              <Input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="مثال: جامعة الأردن، برمجة"
                className="border-2 border-black rounded-none neo-shadow h-12"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            size="lg"
            className="w-full text-xl h-16 font-black border-4 border-black rounded-none neo-shadow bg-primary hover:bg-primary/90 text-white mt-4"
          >
            {submitting ? "جاري النشر..." : "انشر الإعلان"}
            {!submitting && <Sparkles className="w-5 h-5 mr-3" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
