import { useGetUsers } from "@workspace/api-client-react";
import { SellerCard } from "@/components/SellerCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";

export default function Sellers() {
  const { data: users, isLoading } = useGetUsers();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
        <div className="bg-accent p-3 border-4 border-black neo-shadow">
          <Users className="w-8 h-8 text-black" />
        </div>
        <h1 className="text-5xl font-display font-black">البائعون الطلاب</h1>
      </div>

      <p className="text-xl font-bold text-muted-foreground mb-12 max-w-2xl">
        تعرّف على المبدعين والمطورين الذين يقودون اقتصاد حرمهم الجامعي. ادعم زملاءك بالتسوق من جامعتك.
      </p>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="h-64 w-full border-4 border-black rounded-none" />
          ))}
        </div>
      ) : users && users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map((user, i) => (
            <SellerCard key={user.id} user={user} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-4 border-black bg-muted neo-shadow">
          <p className="text-2xl font-display font-black">لا يوجد بائعون.</p>
        </div>
      )}
    </div>
  );
}
