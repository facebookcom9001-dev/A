import { useState as useReactState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useGetListings } from "@workspace/api-client-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";
import type { GetListingsParams } from "@workspace/api-client-react";
import { ListingCard } from "@/components/ListingCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type GetListingsSort = NonNullable<GetListingsParams["sort"]>;

function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useReactState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function Listings() {
  const [location, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);

  const initialCategory = searchParams.get("category") || "all";
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useReactState(initialSearch);
  const debouncedSearch = useDebounceValue(searchTerm, 500);

  const [category, setCategory] = useReactState(initialCategory);
  const [sort, setSort] = useReactState<GetListingsSort>("newest");
  const [priceRange, setPriceRange] = useReactState([0, 1000]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category && category !== "all") params.set("category", category);
    if (sort && sort !== "newest") params.set("sort", sort);

    const newSearch = params.toString();
    const target = `/listings${newSearch ? `?${newSearch}` : ''}`;

    if (target !== location + (searchString ? `?${searchString}` : '')) {
      setLocation(target, { replace: true });
    }
  }, [debouncedSearch, category, sort, setLocation, location, searchString]);

  const { data: listings, isLoading } = useGetListings({
    search: debouncedSearch || undefined,
    category: category !== "all" ? category : undefined,
    sort,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  });


  const resetFilters = () => {
    setSearchTerm("");
    setCategory("all");
    setSort("newest");
    setPriceRange([0, 1000]);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-5xl font-display font-black mb-8 border-b-4 border-black pb-4">السوق</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className="bg-card border-4 border-black p-4 neo-shadow">
            <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-black">
              <h2 className="font-display font-black text-xl flex items-center">
                <Filter className="ml-2 w-5 h-5" /> التصفية
              </h2>
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2 font-bold text-xs">
                إعادة تعيين
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground">البحث</label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث عن شيء..."
                    className="pr-9 border-2 border-black rounded-none neo-shadow focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="absolute left-3 top-3">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground">الفئة</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-2 border-black rounded-none neo-shadow font-bold focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <SelectItem value="all" className="font-bold cursor-pointer">جميع الفئات</SelectItem>
                    {MARKETPLACE_CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value} className="font-bold cursor-pointer">
                        {c.emoji} {c.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground">الترتيب</label>
                <Select value={sort} onValueChange={(val: GetListingsSort) => setSort(val)}>
                  <SelectTrigger className="border-2 border-black rounded-none neo-shadow font-bold focus:ring-0 focus:ring-offset-0">
                    <SelectValue placeholder="ترتيب" />
                  </SelectTrigger>
                  <SelectContent className="border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <SelectItem value="newest" className="font-bold cursor-pointer">الأحدث</SelectItem>
                    <SelectItem value="price_asc" className="font-bold cursor-pointer">السعر: من الأقل للأعلى</SelectItem>
                    <SelectItem value="price_desc" className="font-bold cursor-pointer">السعر: من الأعلى للأقل</SelectItem>
                    <SelectItem value="popular" className="font-bold cursor-pointer">الأكثر شعبية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t-2 border-black">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-black text-muted-foreground">أعلى سعر</label>
                  <span className="font-bold">{priceRange[1]} JD</span>
                </div>
                <Slider
                  min={0}
                  max={2000}
                  step={10}
                  value={[priceRange[1]]}
                  onValueChange={(val) => setPriceRange([0, val[0]])}
                  className="[&>span]:border-2 [&>span]:border-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="h-[200px] w-full border-4 border-black rounded-none" />
                  <Skeleton className="h-6 w-3/4 border-2 border-black rounded-none" />
                </div>
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div>
              <div className="mb-4 font-bold text-muted-foreground flex justify-between items-center border-b-2 border-black pb-2">
                <span>عرض {listings.length} منتج</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing, i) => (
                  <ListingCard key={listing.id} listing={listing} index={i} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-32 border-4 border-black bg-accent/20 neo-shadow flex flex-col items-center justify-center">
              <div className="bg-white p-4 border-4 border-black neo-shadow mb-4 rotate-3">
                <Search className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-black mb-2">لا توجد نتائج</h3>
              <p className="font-bold text-muted-foreground mb-6">حاول تعديل الفلاتر أو كلمة البحث.</p>
              <Button onClick={resetFilters} className="neo-shadow rounded-none border-2 border-black font-bold">
                مسح التصفية
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
