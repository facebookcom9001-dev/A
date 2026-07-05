import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Rocket, Plus, TrendingUp, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ContactDialog } from "@/components/ContactDialog";

const STAGES = ["فكرة", "نموذج أولي", "إطلاق", "نمو", "استثمار مطلوب"];

async function fetchSection(search?: string, stage?: string) {
  const params = new URLSearchParams({ section: "startups" });
  if (search) params.set("search", search);
  if (stage) params.set("category", stage);
  const res = await fetch(`/api/listings?${params}`);
  if (!res.ok) throw new Error("خطأ");
  return res.json() as Promise<any[]>;
}

export default function Startups() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [query, setQuery] = useState({ search: "", stage: "" });
  const [contactListing, setContactListing] = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["startups", query],
    queryFn: () => fetchSection(query.search, query.stage),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-accent p-3 border-2 border-black neo-shadow">
            <Rocket className="w-7 h-7 text-black" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display">Startup Hub 🚀</h1>
            <p className="text-sm text-muted-foreground font-bold">اعرض فكرتك، ابحث عن شريك أو مستثمر</p>
          </div>
        </div>
        <Button asChild className="neo-shadow rounded-none border-2 border-black font-bold">
          <Link href="/sell?section=startups"><Plus className="w-4 h-4 ml-1" />أضف فكرة</Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder="ابحث عن فكرة أو مشروع..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-2 border-black rounded-none neo-shadow font-bold max-w-xs"
          onKeyDown={e => e.key === "Enter" && setQuery({ search, stage })}
        />
        <div className="flex gap-2 flex-wrap">
          {["", ...STAGES].map(s => (
            <button
              key={s}
              onClick={() => { setStage(s); setQuery({ search, stage: s }); }}
              className={`px-3 py-2 border-2 border-black font-bold text-sm transition-colors ${stage === s ? "bg-accent text-black" : "bg-white hover:bg-accent/20"}`}
            >
              {s || "الكل"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="border-4 border-black neo-shadow animate-pulse bg-muted h-48" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-black text-muted-foreground">لا توجد أفكار بعد</p>
          <p className="text-sm font-bold text-muted-foreground mt-2">شارك فكرتك الريادية!</p>
          <Button asChild className="mt-4 neo-shadow rounded-none border-2 border-black font-bold">
            <Link href="/sell?section=startups">أضف فكرتك</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item: any) => (
            <div key={item.id} className="border-4 border-black neo-shadow bg-card p-5 hover:-translate-y-1 hover:-translate-x-1 transition-transform">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-black text-lg leading-tight">{item.title}</h3>
                {item.category && (
                  <span className="bg-accent text-black text-xs font-black px-2 py-1 border border-black flex-shrink-0">{item.category}</span>
                )}
              </div>
              <p className="text-sm font-bold text-muted-foreground mb-4 line-clamp-3">{item.description}</p>
              {item.price > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-green-700" />
                  <span className="text-sm font-black text-green-700">استثمار مطلوب: {item.price} د.أ</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black">{item.sellerName}</p>
                  <p className="text-xs text-muted-foreground font-bold">{item.sellerUniversity}</p>
                </div>
                <Button size="sm" onClick={() => setContactListing(item)} className="border-2 border-black rounded-none neo-shadow font-bold text-xs">
                  تواصل
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactListing && <ContactDialog listing={contactListing} onClose={() => setContactListing(null)} />}
    </div>
  );
}
