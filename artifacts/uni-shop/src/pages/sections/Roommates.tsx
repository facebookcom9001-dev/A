import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home, Plus, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ContactDialog } from "@/components/ContactDialog";
import { ROOM_GENDER } from "@/lib/constants";

async function fetchSection(search?: string) {
  const params = new URLSearchParams({ section: "roommates" });
  if (search) params.set("search", search);
  const res = await fetch(`/api/listings?${params}`);
  if (!res.ok) throw new Error("خطأ");
  return res.json() as Promise<any[]>;
}

export default function Roommates() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [contactListing, setContactListing] = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["roommates", query],
    queryFn: () => fetchSection(query),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-secondary p-3 border-2 border-black neo-shadow">
            <Home className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display">شريك سكن</h1>
            <p className="text-sm text-muted-foreground font-bold">ابحث عن زميل للسكن بالقرب من جامعتك</p>
          </div>
        </div>
        <Button asChild className="neo-shadow rounded-none border-2 border-black font-bold">
          <Link href="/sell?section=roommates"><Plus className="w-4 h-4 ml-1" />أضف إعلان</Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6">
        <Input
          placeholder="ابحث بالمنطقة أو الجامعة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-2 border-black rounded-none neo-shadow font-bold max-w-xs"
          onKeyDown={e => e.key === "Enter" && setQuery(search)}
        />
        <Button onClick={() => setQuery(search)} className="border-2 border-black rounded-none neo-shadow font-bold">بحث</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="border-4 border-black neo-shadow animate-pulse bg-muted h-48" />)}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <Home className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-black text-muted-foreground">لا توجد إعلانات سكن بعد</p>
          <Button asChild className="mt-4 neo-shadow rounded-none border-2 border-black font-bold">
            <Link href="/sell?section=roommates">أضف إعلان سكن</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item: any) => (
            <div key={item.id} className="border-4 border-black neo-shadow bg-card hover:-translate-y-1 hover:-translate-x-1 transition-transform">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover border-b-4 border-black" />
              )}
              <div className="p-4">
                <h3 className="font-black text-base mb-2">{item.title}</h3>
                <p className="text-xs font-bold text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-3 text-xs font-bold mb-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.sellerUniversity}</span>
                  {item.price > 0 && <span className="text-green-700 font-black">{item.price} د.أ/شهر</span>}
                </div>
                {item.category && (
                  <div className="flex items-center gap-1 mb-3">
                    <Users className="w-3 h-3" />
                    <span className="text-xs font-bold">{item.category}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black">{item.sellerName}</span>
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
