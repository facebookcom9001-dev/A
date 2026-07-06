import { useParams, Link } from "wouter";
import { useState as useReactState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useGetListing,
  useToggleFavorite,
  useGetListings,
  getGetListingQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ContactDialog } from "@/components/ContactDialog";
import { Heart, MessageCircle, MapPin, Tag, User as UserIcon, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const statusMap: Record<string, string> = {
  available: "متاح",
  sold: "مُباع",
  reserved: "محجوز",
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const listingId = parseInt(id, 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: listing, isLoading, error } = useGetListing(listingId, {
    query: {
      enabled: !isNaN(listingId),
      queryKey: getGetListingQueryKey(listingId)
    }
  });

  const { data: related } = useGetListings({
    category: listing?.category,
  }, {
    query: {
      enabled: !!listing?.category,
      queryKey: ["getListings", { category: listing?.category }] as const,
    }
  });

  const toggleFavorite = useToggleFavorite();
  const [showContact, setShowContact] = useReactState(false);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="h-[500px] w-full border-4 border-black rounded-none" />
          <div className="space-y-6">
            <Skeleton className="h-12 w-3/4 border-2 border-black rounded-none" />
            <Skeleton className="h-8 w-1/4 border-2 border-black rounded-none" />
            <Skeleton className="h-32 w-full border-2 border-black rounded-none" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block p-12 border-4 border-black bg-destructive neo-shadow rotate-1">
          <h1 className="text-4xl font-display font-black text-white mb-4">المنتج غير موجود</h1>
          <p className="text-white font-bold mb-8">ربما تم بيع هذا المنتج أو حذفه.</p>
          <Button asChild className="bg-card text-foreground hover:bg-muted border-2 border-black neo-shadow rounded-none font-bold">
            <Link href="/listings">العودة للسوق</Link>
          </Button>
        </div>
      </div>
    );
  }

  let imageSrc = listing.imageUrl;
  if (!imageSrc) {
    if (listing.category.toLowerCase() === 'art') imageSrc = '/images/art-placeholder.png';
    else if (listing.category.toLowerCase() === 'software') imageSrc = '/images/software-placeholder.png';
    else imageSrc = '/images/handmade-placeholder.png';
  }

  const handleFavorite = () => {
    toggleFavorite.mutate({ data: { userId: user?.id ?? 0, listingId } }, {
      onSuccess: (res) => {
        queryClient.setQueryData(getGetListingQueryKey(listingId), (old: any) => {
          if (!old) return old;
          return { ...old, favoriteCount: old.favoriteCount + (res.favorited ? 1 : -1) };
        });
        toast({
          title: res.favorited ? "أُضيف إلى المفضلة!" : "حُذف من المفضلة",
          className: "border-4 border-black rounded-none neo-shadow font-bold",
        });
      }
    });
  };

  const relatedListings = related?.filter(r => r.id !== listing.id).slice(0, 3) || [];

  return (
    <div className="container mx-auto px-4 py-10">
      <Button asChild variant="link" className="mb-6 font-bold p-0 hover:text-primary">
        <Link href="/listings"><ArrowRight className="w-4 h-4 ml-2" /> العودة للمنتجات</Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        {/* Left Col - Image */}
        <div className="relative group">
          <div className="absolute inset-0 bg-accent translate-x-4 translate-y-4 border-4 border-black"></div>
          <div className="relative bg-card border-4 border-black aspect-square overflow-hidden neo-shadow">
            <img
              src={imageSrc}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="border-2 border-black rounded-none font-bold bg-primary text-white neo-shadow">
                {statusMap[listing.status] ?? listing.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Col - Details */}
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="border-2 border-black rounded-none font-bold bg-secondary text-white">
              {listing.category}
            </Badge>
            <span className="text-sm font-bold text-muted-foreground flex items-center">
              <Tag className="w-4 h-4 ml-1" /> {listing.tags || "لا توجد وسوم"}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight mb-2 leading-tight">
            {listing.title}
          </h1>

          <div className="text-4xl font-black text-primary mb-6" style={{ WebkitTextStroke: '1.5px black' }}>
            {listing.price.toFixed(3)} JD
          </div>

          <div className="flex gap-4 mb-8">
            <Button
              onClick={handleFavorite}
              variant="outline"
              className="border-4 border-black rounded-none neo-shadow font-bold hover:bg-destructive hover:text-white group flex-1 h-14"
              disabled={toggleFavorite.isPending}
            >
              <Heart className="w-5 h-5 ml-2 group-hover:scale-125 transition-transform" />
              المفضلة ({listing.favoriteCount})
            </Button>
          </div>

          <div className="bg-muted border-4 border-black p-6 neo-shadow mb-8 relative">
            <h3 className="font-display font-black text-xl mb-4 absolute -top-4 bg-card border-2 border-black px-2 py-1">الوصف</h3>
            <p className="whitespace-pre-wrap font-medium pt-2">{listing.description}</p>
            <div className="text-xs font-bold text-muted-foreground mt-4 pt-4 border-t-2 border-black/20">
              أُضيف في {format(new Date(listing.createdAt), "d MMM yyyy", { locale: ar })}
            </div>
          </div>

          {/* Seller Card & Contact */}
          <div className="mt-auto border-4 border-black p-6 bg-accent/20 neo-shadow">
            <h3 className="font-display font-black text-xl mb-4">عن البائع</h3>

            <Link href={`/sellers/${listing.sellerId}`}>
              <div className="flex items-center gap-4 mb-6 p-3 bg-card border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full border-2 border-black bg-primary flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold">{listing.sellerName}</div>
                  <div className="text-xs font-bold text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 ml-1" /> {listing.sellerUniversity}
                  </div>
                </div>
              </div>
            </Link>

            {user?.id !== listing.sellerId ? (
              <Button
                onClick={() => setShowContact(true)}
                className="w-full border-2 border-black rounded-none neo-shadow font-bold bg-primary hover:bg-primary/90 text-white h-12"
              >
                <MessageCircle className="w-5 h-5 ml-2" />
                راسل البائع
              </Button>
            ) : (
              <p className="text-center text-sm font-bold text-muted-foreground">هذا إعلانك</p>
            )}
          </div>

          {showContact && (
            <ContactDialog
              listing={{ id: listing.id, title: listing.title, sellerId: listing.sellerId, sellerName: listing.sellerName }}
              onClose={() => setShowContact(false)}
            />
          )}
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <section className="pt-10 border-t-4 border-black">
          <h2 className="text-3xl font-display font-black mb-8">منتجات مشابهة</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.map((relatedListing, i) => (
              <ListingCard key={relatedListing.id} listing={relatedListing} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
