import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Handshake, Plus, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ContactDialog } from "@/components/ContactDialog";

const BORROW_CATS = ["كتب", "أدوات", "إلكترونيات", "ملابس", "معدات رياضية", "أخرى"];

async function fetchSection(search?: string, cat?: string) {
  const params = new URLSearchParams({ section: "borrow" });
  if (search) params.set("search", search);
  if (cat) params.set("category", cat);
  const res = await fetch(`/api/listings?${params}`);
  if (!res.ok) throw new Error("خطأ");
  return res.json() as Promise<any[]>;
}

export default function Borrow() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [query, setQuery] = useState({ search: "", cat: "" });
  const [contactListing, setContactListing] = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["borrow", query],
    queryFn: () => fetchSection(query.search, query.cat),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-3 border-2 border-black neo-shadow">
            <Handshake className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display">Borrow Hub 🤝</h1>
            <p className="text-sm text-muted-foreground font-bold">استعر بدل ما تشتري — وفّر فلوسك</p>
          </div>
        </div>
        <Button asChild className="neo-shadow rounded-none border-2 border-black font-bold">
          <Link href="/sell?section=borrow"><Plus className="w-4 h-4 ml-1" />أضف شيء للاستعارة</Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder="ابحث عما تريد استعارته..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-2 border-black rounded-none neo-shadow font-bold max-w-xs"
          onKeyDown={e => e.key === "Enter" && setQuery({ search, cat })}
        />
        <div className="flex gap-2 flex-wrap">
          {["", ...BORROW_CATS].map(c => (
            <button
              key={c}
              onClick={() => { setCat(c); setQuery({ search, cat: c }); }}
              className={`px-3 py-2 border-2 border-black font-bold text-sm transition-colors ${cat === c ? "bg-secondary text-white" : "bg-white hover:bg-secondary/10"}`}
            >
              {c || "الكل"}
            </button>
          ))}
        </div>
        <Button onClick={() => setQuery({ search, cat })} className="border-2 border-black rounded-none neo-shadow font-bold">بحث</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="border-4 border-black neo-shadow animate-pulse bg-muted h-40" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <Handshake className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-black text-muted-foreground">لا توجد عناصر للاستعارة بعد</p>
          <p className="text-sm font-bold text-muted-foreground mt-2">شارك شيئاً تملكه وساعد زميلك!</p>
          <Button asChild className="mt-4 neo-shadow rounded-none border-2 border-black font-bold">
            <Link href="/sell?section=borrow">أضف شيئاً للاستعارة</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item: any) => (
            <div key={item.id} className="border-4 border-black neo-shadow bg-card hover:-translate-y-1 hover:-translate-x-1 transition-transform">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover border-b-4 border-black" />
              )}
              <div className="p-4">
                {item.category && (
                  <span className="inline-flex items-center gap-1 bg-secondary/20 text-secondary text-xs font-black px-2 py-1 border border-black mb-2">
                    <Tag className="w-3 h-3" />{item.category}
                  </span>
                )}
                <h3 className="font-black text-base mb-2">{item.title}</h3>
                <p className="text-xs font-bold text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 text-xs font-bold mb-3">
                  {item.price > 0 && (
                    <span className="flex items-center gap-1 text-primary font-black">
                      <Calendar className="w-3 h-3" />{item.price} د.أ/يوم
                    </span>
                  )}
                  {item.price === 0 && (
                    <span className="text-green-700 font-black">مجاناً</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black">{item.sellerName}</p>
                    <p className="text-xs text-muted-foreground">{item.sellerUniversity}</p>
                  </div>
                  <Button size="sm" onClick={() => setContactListing(item)} className="border-2 border-black rounded-none neo-shadow font-bold text-xs">
                    استعر
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactListing && <ContactDialog listing={contactListing} onClose={() => setContactListing(null)} />}
    </div>
  );
}
