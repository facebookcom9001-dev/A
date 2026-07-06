import { Link } from "wouter";
import type { Listing } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { MARKETPLACE_CATEGORIES } from "@/lib/constants";

function getCategoryEmoji(category: string): string {
  return MARKETPLACE_CATEGORIES.find(c => c.value === category)?.emoji ?? "📦";
}

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

export function ListingCard({ listing, index = 0 }: ListingCardProps) {
  const delay = index * 100;

  let imageSrc = listing.imageUrl;
  if (!imageSrc) {
    if (listing.category.toLowerCase() === 'art') imageSrc = '/images/art-placeholder.png';
    else if (listing.category.toLowerCase() === 'software') imageSrc = '/images/software-placeholder.png';
    else imageSrc = '/images/handmade-placeholder.png';
  }

  const statusMap: Record<string, string> = {
    available: "متاح",
    sold: "مُباع",
    reserved: "محجوز",
  };

  return (
    <Link href={`/listings/${listing.id}`}>
      <div
        className="group block animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-both h-full"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="bg-card border-4 border-black neo-shadow flex flex-col h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-2 group-hover:-translate-x-1 group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
          <div className="aspect-[4/3] w-full border-b-4 border-black overflow-hidden relative">
            <img
              src={imageSrc}
              alt={listing.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute top-2 left-2 bg-card border-2 border-black p-1.5 flex items-center justify-center neo-shadow z-10">
              <Heart className="h-5 w-5 text-destructive" />
              <span className="mr-1 font-bold text-sm">{listing.favoriteCount}</span>
            </div>
            <div className="absolute bottom-0 right-0 bg-primary text-white border-t-4 border-l-4 border-black px-3 py-1 font-black text-lg">
              {listing.price.toFixed(3)} JD
            </div>
          </div>

          <div className="p-4 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2">
              <Badge variant="outline" className="border-2 border-black bg-secondary text-white font-bold rounded-none uppercase text-xs">
                {getCategoryEmoji(listing.category)} {listing.category}
              </Badge>
              <span className="text-xs font-bold text-muted-foreground border-2 border-black px-2 py-0.5 bg-gray-100">
                {statusMap[listing.status] ?? listing.status}
              </span>
            </div>

            <h3 className="font-display font-black text-xl mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
              {listing.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1 font-medium">
              {listing.description}
            </p>

            <div className="pt-3 border-t-2 border-black mt-auto flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-black text-gray-500">البائع</span>
                <span className="font-bold text-sm truncate">{listing.sellerName}</span>
              </div>
              <div className="text-left flex flex-col items-start">
                <span className="text-xs font-black text-gray-500">الجامعة</span>
                <span className="font-bold text-sm truncate max-w-[100px]">{listing.sellerUniversity}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
