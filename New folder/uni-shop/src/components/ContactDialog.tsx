import { useState } from "react";
import { useLocation } from "wouter";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const TOKEN_KEY = "uni_shop_token";
function getToken() { return localStorage.getItem(TOKEN_KEY); }

async function startConversation(receiverId: number, listingId: number, message: string) {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch("/api/messages/start", {
    method: "POST",
    headers,
    body: JSON.stringify({ receiverId, listingId, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "خطأ" }));
    throw new Error(err.error || "خطأ في الإرسال");
  }
  return res.json() as Promise<{ conversationId: number }>;
}

interface Props {
  listing: {
    id: number;
    title: string;
    sellerId: number;
    sellerName: string;
  };
  onClose: () => void;
}

export function ContactDialog({ listing, onClose }: Props) {
  const [message, setMessage] = useState(`مرحباً، أنا مهتم بـ "${listing.title}". هل لا يزال متاحاً؟`);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const send = async () => {
    if (!message.trim()) return;
    if (user?.id === listing.sellerId) {
      toast({ title: "تنبيه", description: "لا يمكنك مراسلة نفسك", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { conversationId } = await startConversation(listing.sellerId, listing.id, message);
      toast({ title: "تم الإرسال!", description: "يمكنك متابعة المحادثة في صفحة الرسائل" });
      onClose();
      navigate(`/messages/${conversationId}`);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-card border-4 border-black neo-shadow w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 border-2 border-black">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-black text-base">تواصل مع {listing.sellerName}</h2>
              <p className="text-xs text-muted-foreground font-bold truncate max-w-[200px]">{listing.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="border-2 border-black p-1 hover:bg-accent/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <Textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          rows={4}
          className="border-2 border-black rounded-none neo-shadow font-bold text-sm mb-4 resize-none"
          placeholder="اكتب رسالتك..."
        />

        <div className="flex gap-3">
          <Button
            onClick={send}
            disabled={sending || !message.trim()}
            className="flex-1 border-2 border-black rounded-none neo-shadow font-black"
          >
            {sending ? "جاري الإرسال..." : "أرسل رسالة"}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-2 border-black rounded-none font-bold"
          >
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}
