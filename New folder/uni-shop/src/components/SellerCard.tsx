import { Link } from "wouter";
import type { User } from "@workspace/api-client-react";
import { User as UserIcon, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface SellerCardProps {
  user: User;
  index?: number;
}

export function SellerCard({ user, index = 0 }: SellerCardProps) {
  const delay = index * 100;

  return (
    <Link href={`/sellers/${user.id}`}>
      <div
        className="group block animate-in fade-in zoom-in-95 duration-500 fill-mode-both"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="bg-card border-4 border-black neo-shadow p-6 flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-2 group-hover:bg-accent/20">
          <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden mb-4 bg-primary flex items-center justify-center neo-shadow">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-12 h-12 text-white" />
            )}
          </div>

          <h3 className="font-display font-black text-xl mb-1 group-hover:text-primary transition-colors">{user.name}</h3>

          <div className="flex items-center text-sm font-bold text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 ml-1" />
            {user.university}
          </div>

          <p className="text-sm line-clamp-2 mb-4 h-10 italic">
            "{user.bio || "لا توجد نبذة تعريفية"}"
          </p>

          <div className="flex items-center text-xs font-bold text-gray-400 mt-auto">
            <Calendar className="w-3 h-3 ml-1" />
            انضم في {format(new Date(user.createdAt), "MMM yyyy", { locale: ar })}
          </div>
        </div>
      </div>
    </Link>
  );
}
