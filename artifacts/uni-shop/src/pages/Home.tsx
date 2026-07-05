import { Link } from "wouter";
import {
  useGetFeaturedListings,
  useGetRecentListings,
  useGetCategoryStats,
  useGetStats
} from "@workspace/api-client-react";
import { ListingCard } from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Tag, Users, ShoppingCart, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SECTIONS } from "@/lib/constants";

export default function Home() {
  const { data: featured, isLoading: isLoadingFeatured } = useGetFeaturedListings();
  const { data: recent, isLoading: isLoadingRecent } = useGetRecentListings();
  const { data: stats } = useGetStats();
  const { data: categories } = useGetCategoryStats();

  return (
    <div className="flex flex-col gap-20 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b-4 border-black bg-primary/10">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-accent text-black font-black text-sm mb-6 neo-shadow">
                <Sparkles className="w-4 h-4" />
                <span>سوق الطلاب الجامعي</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight mb-6 leading-[0.9]">
                اشترِ وبِع
                <br/>
                <span className="text-primary" style={{ WebkitTextStroke: '2px black' }}>إبداع الطلاب</span>
              </h1>
              <p className="text-xl md:text-2xl font-medium mb-8 border-r-4 border-black pr-4">
                سوق رقمي نابض بالحياة يجعل إبداعك مصدر دخل. اعثر على فنون وبرامج وإبداعات يدوية من طلاب في كل مكان.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="neo-shadow text-lg font-black rounded-none border-2 border-black">
                  <Link href="/listings">ابدأ التصفح</Link>
                </Button>
                <Button asChild size="lg" variant="secondary" className="neo-shadow text-lg font-black rounded-none border-2 border-black bg-white text-black hover:bg-gray-100">
                  <Link href="/sell">صِر بائعاً</Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-secondary translate-x-4 translate-y-4 border-4 border-black"></div>
              <img
                src="/images/hero-banner.png"
                alt="سوق الطلاب"
                className="w-full relative z-10 border-4 border-black object-cover aspect-[4/3] grayscale-[20%] contrast-[1.2]"
              />
            </div>
          </div>
        </div>

        <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent rounded-full blur-3xl opacity-50 z-0"></div>
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary rounded-full blur-3xl opacity-20 z-0"></div>
      </section>

      {/* Stats ticker */}
      <div className="bg-black text-white py-4 overflow-hidden border-y-4 border-black flex">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap gap-16 font-display font-black text-2xl items-center">
          {stats ? (
            <>
              <div className="flex items-center gap-2"><Tag className="w-6 h-6 text-primary"/> {stats.totalListings} منتج معروض</div>
              <div className="flex items-center gap-2"><Users className="w-6 h-6 text-accent"/> {stats.totalUsers} طالب نشط</div>
              <div className="flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-secondary"/> {stats.totalSold} منتج مُباع</div>

              <div className="flex items-center gap-2"><Tag className="w-6 h-6 text-primary"/> {stats.totalListings} منتج معروض</div>
              <div className="flex items-center gap-2"><Users className="w-6 h-6 text-accent"/> {stats.totalUsers} طالب نشط</div>
              <div className="flex items-center gap-2"><ShoppingCart className="w-6 h-6 text-secondary"/> {stats.totalSold} منتج مُباع</div>
            </>
          ) : (
            <div>جاري تحميل إحصاءات السوق...</div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />

      {/* Sections Grid */}
      <section className="container mx-auto px-4">
        <h2 className="text-4xl font-display font-black mb-8 text-center">استكشف الأقسام</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SECTIONS.map((s) => (
            <Link key={s.value} href={s.path}>
              <div className="bg-white border-4 border-black p-6 flex flex-col items-center justify-center neo-shadow hover:bg-primary hover:text-white transition-colors group cursor-pointer h-full min-h-[120px] gap-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">{s.emoji}</span>
                <span className="font-display font-black text-center text-sm leading-tight">{s.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-display font-black">منتجات مميزة</h2>
          <Link href="/listings" className="font-bold flex items-center hover:text-primary transition-colors">
            عرض الكل <ArrowLeft className="mr-2 w-5 h-5" />
          </Link>
        </div>

        {isLoadingFeatured ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-[200px] w-full border-4 border-black rounded-none" />
                <Skeleton className="h-6 w-3/4 border-2 border-black rounded-none" />
                <Skeleton className="h-4 w-1/2 border-2 border-black rounded-none" />
              </div>
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.slice(0, 4).map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-black bg-muted neo-shadow">
            <p className="text-xl font-bold">لا توجد منتجات مميزة بعد.</p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-secondary/10 py-20 border-y-4 border-black">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-display font-black mb-10 text-center">تصفح حسب الفئة</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories ? categories.map((cat) => (
              <Link key={cat.category} href={`/listings?category=${cat.category}`}>
                <div className="bg-white border-4 border-black p-6 flex flex-col items-center justify-center neo-shadow hover:bg-accent transition-colors group cursor-pointer h-full">
                  <h3 className="font-display font-black text-xl mb-2 group-hover:scale-110 transition-transform">{cat.category}</h3>
                  <Badge variant="outline" className="border-2 border-black font-bold">
                    {cat.count} منتج
                  </Badge>
                </div>
              </Link>
            )) : (
              [1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Skeleton key={i} className="h-32 border-4 border-black rounded-none" />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Recent Section */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-10 border-b-4 border-black pb-4">
          <h2 className="text-4xl font-display font-black">جديد في الحرم</h2>
        </div>

        {isLoadingRecent ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-[200px] w-full border-4 border-black rounded-none" />
                <Skeleton className="h-6 w-3/4 border-2 border-black rounded-none" />
                <Skeleton className="h-4 w-1/2 border-2 border-black rounded-none" />
              </div>
            ))}
          </div>
        ) : recent && recent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recent.slice(0, 4).map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-black bg-muted neo-shadow">
            <p className="text-xl font-bold">لا توجد منتجات حديثة.</p>
          </div>
        )}
      </section>
    </div>
  );
}
