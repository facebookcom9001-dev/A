import { useParams, Link } from "wouter";
import {
  useGetUser,
  useGetUserListings,
  getGetUserQueryKey
} from "@workspace/api-client-react";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Package, ArrowRight, User as UserIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const userId = parseInt(id, 10);

  const { data: user, isLoading: isLoadingUser, error } = useGetUser(userId, {
    query: {
      enabled: !isNaN(userId),
      queryKey: getGetUserQueryKey(userId)
    }
  });

  const { data: listings, isLoading: isLoadingListings } = useGetUserListings(userId, {
    query: {
      enabled: !isNaN(userId),
      queryKey: ["getUserListings", userId] as const,
    }
  });

  if (isLoadingUser) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Skeleton className="h-64 w-full border-4 border-black rounded-none mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-[300px] w-full border-4 border-black rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-display font-black mb-4">البائع غير موجود</h1>
        <Button asChild className="bg-primary text-white border-2 border-black neo-shadow rounded-none font-bold">
          <Link href="/sellers">العودة للبائعين</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <Button asChild variant="link" className="mb-6 font-bold p-0 hover:text-primary">
        <Link href="/sellers"><ArrowRight className="w-4 h-4 ml-2" /> العودة للبائعين</Link>
      </Button>

      {/* Seller Header */}
      <div className="bg-card border-4 border-black neo-shadow p-8 md:p-12 mb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl opacity-20 -translate-y-1/2 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-black overflow-hidden bg-primary flex-shrink-0 flex items-center justify-center neo-shadow">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-20 h-20 text-white" />
            )}
          </div>

          <div className="flex-1 text-center md:text-right flex flex-col h-full">
            <h1 className="text-4xl md:text-5xl font-display font-black mb-2">
              {user.name}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
              <span className="inline-flex items-center px-3 py-1 bg-secondary text-white font-bold text-sm border-2 border-black neo-shadow">
                <MapPin className="w-4 h-4 ml-1" /> {user.university}
              </span>
              <span className="inline-flex items-center px-3 py-1 bg-muted font-bold text-sm border-2 border-black">
                <Calendar className="w-4 h-4 ml-1" /> انضم في {format(new Date(user.createdAt), "MMM yyyy", { locale: ar })}
              </span>
            </div>

            <div className="bg-white p-4 border-r-4 border-black italic font-medium max-w-2xl mb-4">
              "{user.bio || "لم يكتب هذا البائع نبذة تعريفية بعد."}"
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div>
        <div className="flex items-center gap-3 mb-8 border-b-4 border-black pb-4">
          <Package className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-display font-black">متجره</h2>
          <span className="mr-auto font-bold text-muted-foreground bg-accent px-3 py-1 border-2 border-black text-black">
            {listings?.length || 0} منتج
          </span>
        </div>

        {isLoadingListings ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-[300px] w-full border-4 border-black rounded-none" />
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-4 border-black bg-muted neo-shadow">
            <p className="text-xl font-bold">لا توجد منتجات لهذا البائع.</p>
          </div>
        )}
      </div>
    </div>
  );
}
