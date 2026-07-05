import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Plus, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { ContactDialog } from "@/components/ContactDialog";
import { JOB_TYPES } from "@/lib/constants";

async function fetchSection(search?: string, jobType?: string) {
  const params = new URLSearchParams({ section: "jobs" });
  if (search) params.set("search", search);
  if (jobType) params.set("category", jobType);
  const res = await fetch(`/api/listings?${params}`);
  if (!res.ok) throw new Error("خطأ في تحميل البيانات");
  return res.json() as Promise<any[]>;
}

export default function Jobs() {
  const [search, setSearch] = useState("");
  const [jobType, setJobType] = useState("");
  const [query, setQuery] = useState({ search: "", jobType: "" });
  const [contactListing, setContactListing] = useState<any>(null);

  const { data = [], isLoading } = useQuery({
    queryKey: ["jobs", query],
    queryFn: () => fetchSection(query.search, query.jobType),
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary p-3 border-2 border-black neo-shadow">
            <Briefcase className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-display">فرص عمل</h1>
            <p className="text-sm text-muted-foreground font-bold">وظائف وفرص عمل للطلاب الجامعيين</p>
          </div>
        </div>
        <Button asChild className="neo-shadow rounded-none border-2 border-black font-bold">
          <Link href="/sell?section=jobs"><Plus className="w-4 h-4 ml-1" />أضف فرصة</Link>
        </Button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <Input
          placeholder="ابحث عن وظيفة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border-2 border-black rounded-none neo-shadow font-bold max-w-xs"
          onKeyDown={e => e.key === "Enter" && setQuery({ search, jobType })}
        />
        <div className="flex gap-2 flex-wrap">
          {["", ...JOB_TYPES].map(t => (
            <button
              key={t}
              onClick={() => { setJobType(t); setQuery({ search, jobType: t }); }}
              className={`px-3 py-2 border-2 border-black font-bold text-sm transition-colors ${jobType === t ? "bg-primary text-white" : "bg-white hover:bg-accent/20"}`}
            >
              {t || "الكل"}
            </button>
          ))}
        </div>
        <Button onClick={() => setQuery({ search, jobType })} className="border-2 border-black rounded-none neo-shadow font-bold">بحث</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-4 border-black neo-shadow p-5 animate-pulse bg-muted h-40" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-xl font-black text-muted-foreground">لا توجد فرص عمل بعد</p>
          <p className="text-sm font-bold text-muted-foreground mt-2">كن أول من يضيف فرصة عمل!</p>
          <Button asChild className="mt-4 neo-shadow rounded-none border-2 border-black font-bold">
            <Link href="/sell?section=jobs">أضف فرصة عمل</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((job: any) => (
            <div key={job.id} className="border-4 border-black neo-shadow bg-card p-5 hover:-translate-y-1 hover:-translate-x-1 transition-transform">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-black text-lg leading-tight">{job.title}</h3>
                {job.category && (
                  <span className="bg-primary text-white text-xs font-black px-2 py-1 border border-black flex-shrink-0">{job.category}</span>
                )}
              </div>
              <p className="text-sm font-bold text-muted-foreground mb-3 line-clamp-2">{job.description}</p>
              <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.sellerUniversity}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(job.createdAt).toLocaleDateString("ar-JO")}</span>
                {job.price > 0 && <span className="text-green-700 font-black">{job.price} د.أ</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-muted-foreground">{job.sellerName}</span>
                <Button size="sm" onClick={() => setContactListing(job)} className="border-2 border-black rounded-none neo-shadow font-bold text-xs">
                  تواصل
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {contactListing && (
        <ContactDialog listing={contactListing} onClose={() => setContactListing(null)} />
      )}
    </div>
  );
}
