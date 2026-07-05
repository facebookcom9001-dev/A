import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { MessageCircle, Send, ArrowRight, ShoppingBag, Briefcase, Home, Rocket, Search, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const TOKEN_KEY = "uni_shop_token";

function getToken() { return localStorage.getItem(TOKEN_KEY); }

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`/api${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "خطأ" }));
    throw new Error(err.error || "خطأ في الاتصال");
  }
  return res.json();
}

const sectionIcon: Record<string, React.ReactNode> = {
  marketplace: <ShoppingBag className="w-3 h-3" />,
  jobs: <Briefcase className="w-3 h-3" />,
  roommates: <Home className="w-3 h-3" />,
  startups: <Rocket className="w-3 h-3" />,
  lost_found: <Search className="w-3 h-3" />,
  borrow: <Handshake className="w-3 h-3" />,
};

interface ConvSummary {
  id: number;
  otherUser: { id: number; name: string; university: string; avatarUrl: string | null } | null;
  listing: { id: number; title: string; section: string } | null;
  lastMessage: { content: string; createdAt: string; isMine: boolean } | null;
  unreadCount: number;
  updatedAt: string;
}

interface Msg {
  id: number;
  content: string;
  isMine: boolean;
  isRead: boolean;
  createdAt: string;
}

interface ConvDetail {
  id: number;
  otherUser: { id: number; name: string; university: string; avatarUrl: string | null } | null;
  listing: { id: number; title: string; section: string } | null;
  messages: Msg[];
}

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `${Math.floor(diff / 60)} د`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} س`;
  return `${Math.floor(diff / 86400)} ي`;
}

function Avatar({ name, url, size = 10 }: { name: string; url?: string | null; size?: number }) {
  if (url) return <img src={url} alt={name} className={`w-${size} h-${size} border-2 border-black object-cover flex-shrink-0`} />;
  return (
    <div className={`w-${size} h-${size} bg-primary border-2 border-black flex items-center justify-center flex-shrink-0`}>
      <span className="text-white font-black text-sm">{name?.[0] ?? "؟"}</span>
    </div>
  );
}

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [matchChat, params] = useRoute("/messages/:id");

  const convId = matchChat && params?.id ? parseInt(params.id) : null;

  const [convs, setConvs] = useState<ConvSummary[]>([]);
  const [conv, setConv] = useState<ConvDetail | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConvs = async () => {
    try {
      const data = await apiFetch<ConvSummary[]>("/messages/conversations");
      setConvs(data);
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadConv = async (id: number) => {
    try {
      const data = await apiFetch<ConvDetail>(`/messages/conversations/${id}`);
      setConv(data);
      setConvs(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    }
  };

  useEffect(() => { loadConvs(); }, []);

  useEffect(() => {
    if (convId) loadConv(convId);
    else setConv(null);
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !convId) return;
    setSending(true);
    try {
      const msg = await apiFetch<Msg>(`/messages/conversations/${convId}/send`, {
        method: "POST",
        body: JSON.stringify({ content: text.trim() }),
      });
      setConv(prev => prev ? { ...prev, messages: [...prev.messages, msg] } : prev);
      setText("");
      loadConvs();
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const totalUnread = convs.reduce((a, c) => a + c.unreadCount, 0);

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-primary p-2 border-2 border-black neo-shadow">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black font-display">الرسائل</h1>
          {totalUnread > 0 && (
            <p className="text-xs font-bold text-primary">{totalUnread} رسالة غير مقروءة</p>
          )}
        </div>
      </div>

      <div className="border-4 border-black neo-shadow bg-card flex" style={{ height: "calc(100vh - 220px)", minHeight: 400 }}>
        {/* Sidebar */}
        <div className={`border-l-4 border-black flex flex-col ${convId ? "hidden md:flex w-80 flex-shrink-0" : "flex-1 md:w-80 md:flex-none"}`}>
          <div className="p-3 border-b-2 border-black bg-accent/30">
            <p className="font-black text-sm">المحادثات</p>
          </div>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-black border-t-primary animate-spin" />
            </div>
          ) : convs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground" />
              <p className="font-black text-muted-foreground">لا توجد محادثات بعد</p>
              <p className="text-xs text-muted-foreground font-bold">ابدأ محادثة من أي إعلان</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {convs.map(c => (
                <button
                  key={c.id}
                  onClick={() => navigate(`/messages/${c.id}`)}
                  className={`w-full p-3 border-b-2 border-black/10 flex gap-3 text-right hover:bg-accent/20 transition-colors ${convId === c.id ? "bg-accent/30 border-r-4 border-r-primary" : ""}`}
                >
                  <Avatar name={c.otherUser?.name ?? "؟"} url={c.otherUser?.avatarUrl} size={10} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-black text-sm truncate">{c.otherUser?.name ?? "مستخدم"}</p>
                      <span className="text-xs text-muted-foreground font-bold flex-shrink-0">{timeAgo(c.updatedAt)}</span>
                    </div>
                    {c.listing && (
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-muted-foreground">{sectionIcon[c.listing.section]}</span>
                        <p className="text-xs text-muted-foreground font-bold truncate">{c.listing.title}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <p className={`text-xs truncate ${c.unreadCount > 0 ? "font-black text-foreground" : "text-muted-foreground font-bold"}`}>
                        {c.lastMessage?.isMine ? "أنت: " : ""}{c.lastMessage?.content ?? "ابدأ المحادثة"}
                      </p>
                      {c.unreadCount > 0 && (
                        <span className="bg-primary text-white text-xs font-black px-1.5 py-0.5 border border-black flex-shrink-0">{c.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!convId ? "hidden md:flex" : "flex"}`}>
          {!conv ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-6">
              <MessageCircle className="w-16 h-16 text-muted-foreground" />
              <p className="font-black text-lg text-muted-foreground">اختر محادثة</p>
              <p className="text-sm text-muted-foreground font-bold">أو ابدأ محادثة جديدة من أي إعلان</p>
            </div>
          ) : (
            <>
              <div className="p-3 border-b-4 border-black bg-accent/20 flex items-center gap-3">
                {convId && (
                  <button onClick={() => navigate("/messages")} className="md:hidden p-1 border-2 border-black neo-shadow bg-white">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <Avatar name={conv.otherUser?.name ?? "؟"} url={conv.otherUser?.avatarUrl} size={8} />
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm">{conv.otherUser?.name}</p>
                  <p className="text-xs text-muted-foreground font-bold truncate">{conv.otherUser?.university}</p>
                </div>
                {conv.listing && (
                  <div className="flex items-center gap-1 bg-white border-2 border-black px-2 py-1 text-xs font-bold max-w-[140px]">
                    {sectionIcon[conv.listing.section]}
                    <span className="truncate">{conv.listing.title}</span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {conv.messages.map(m => (
                  <div key={m.id} className={`flex ${m.isMine ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[70%] px-3 py-2 border-2 border-black text-sm font-bold ${m.isMine ? "bg-primary text-white" : "bg-white"}`}>
                      {m.content}
                      <div className={`text-xs mt-1 ${m.isMine ? "text-white/70" : "text-muted-foreground"}`}>
                        {timeAgo(m.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="p-3 border-t-4 border-black flex gap-2 bg-background">
                <Input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="اكتب رسالتك..."
                  className="border-2 border-black rounded-none neo-shadow font-bold flex-1"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !text.trim()} className="border-2 border-black rounded-none neo-shadow">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
