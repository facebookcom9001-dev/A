import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, MapPin, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ContactDialog } from "@/components/ContactDialog";

async function fetchSection(search?: string, status?: string) {
  const params = new URLSearchParams({ section: "lost_found" });
  if (search) params.set("search", search);
  if (status) params.set("category", status);
  const res = await fetch(`/api/listings?${params}`);
  if (!res.ok) throw new Error("خطأ");
  return res.json() as Promise<any[]>;
}

export default function LostFound() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState({ search: "", status: "" });
  const [contactListing, setContactListing] = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["lost_found", query],
    queryFn: () => fetchSection(query.search, query.status),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-destructive p-3 border-2 border-black neo-shadow">
            <Search className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display">مفقودات</h1>
            <p className="text-sm text-muted-foreground font-bold">ضيّعت شيء أو وجدت شيء؟ أبلغ هنا</p>
          </div>
        </div>
        <Button asChild className="neo-shadow rounded-none border-2 border-black font-bold">
          <Link href="/sell?section=lost_found"><Plus className="w-4 h-4 ml-1" />أضف بلاغ</Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder="ابحث عن شيء مفقود..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-2 border-black rounded-none neo-shadow font-bold max-w-xs"
          onKeyDown={e => e.key === "Enter" && setQuery({ search, status })}
        />
        <div className="flex gap-2">
          {[
            { v: "", l: "الكل" },
            { v: "مفقود", l: "🔴 مفقود" },
            { v: "تم إيجاده", l: "🟢 تم إيجاده" },
          ].map(({ v, l }) => (
            <button
              key={v}
              onClick={() => { setStatus(v); setQuery({ search, status: v }); }}
              className={`px-3 py-2 border-2 border-black font-bold text-sm transition-colors ${status === v ? "bg-destructive text-white" : "bg-card hover:bg-destructive/10"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <Button onClick={() => setQuery({ search, status })} className="border-2 border-black rounded-none neo-shadow font-bold">بحث</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="border-4 border-black neo-shadow animate-pulse bg-muted h-40" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-black text-muted-foreground">لا توجد بلاغات بعد</p>
          <Button asChild className="mt-4 neo-shadow rounded-none border-2 border-black font-bold">
            <Link href="/sell?section=lost_found">أضف بلاغ</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item: any) => (
            <div key={item.id} className={`border-4 border-black neo-shadow bg-card hover:-translate-y-1 hover:-translate-x-1 transition-transform ${item.category === "تم إيجاده" ? "border-green-500" : "border-red-500"}`}>
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover border-b-4 border-black" />
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  {item.category === "تم إيجاده"
                    ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
                  <span className={`text-xs font-black ${item.category === "تم إيجاده" ? "text-green-700" : "text-red-700"}`}>
                    {item.category || "مفقود"}
                  </span>
                </div>
                <h3 className="font-black text-base mb-2">{item.title}</h3>
                <p className="text-xs font-bold text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                    <MapPin className="w-3 h-3" />{item.sellerUniversity}
                  </span>
                  <Button size="sm" onClick={() => setContactListing(item)} className="border-2 border-black rounded-none neo-shadow font-bold text-xs">
                    تواصل
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
