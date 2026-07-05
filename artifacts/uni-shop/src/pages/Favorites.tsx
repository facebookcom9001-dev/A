import { Link } from "wouter";
import { useGetFavorites } from "@workspace/api-client-react";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Heart, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Favorites() {
  const { user } = useAuth();
  const userId = user?.id ?? 0;
  const { data: favorites, isLoading } = useGetFavorites({ userId });

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="bg-destructive p-3 border-4 border-black neo-shadow text-white">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <h1 className="text-5xl font-display font-black">مفضلتك</h1>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-[300px] w-full border-4 border-black rounded-none" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {favorites.map((listing, i) => (
            <ListingCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-4 border-black bg-accent/20 neo-shadow flex flex-col items-center justify-center max-w-3xl mx-auto">
          <div className="bg-white p-6 border-4 border-black neo-shadow mb-6 -rotate-6">
            <Heart className="w-16 h-16 text-destructive" />
          </div>
          <h3 className="text-3xl font-display font-black mb-4">لا شيء محفوظ بعد</h3>
          <p className="font-bold text-muted-foreground mb-8 text-lg">
            احفظ المنتجات التي تعجبك هنا لتجدها لاحقاً. السوق مليء بكنوز خفية!
          </p>
          <Button asChild size="lg" className="neo-shadow rounded-none border-4 border-black font-black text-lg h-14 px-8">
            <Link href="/listings">
              <Search className="w-5 h-5 ml-2" /> ابدأ التصفح
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
