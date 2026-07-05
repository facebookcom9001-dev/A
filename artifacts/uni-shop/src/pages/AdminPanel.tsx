import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Shield, Plus, Trash2, Megaphone, Users, Ban, CheckCircle2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Announcement {
  id: number;
  title: string;
  body: string;
  createdAt: string;
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  university: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminPanel() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      const res = await fetch("/api/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل التحميل");
      return res.json();
    },
    enabled: !!token,
  });

  const { data: users, isLoading: isLoadingUsers } = useQuery<AdminUser[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("فشل التحميل");
      return res.json();
    },
    enabled: !!token && !!user?.isAdmin,
  });

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
        <h1 className="text-3xl font-black">وصول مرفوض</h1>
        <p className="text-muted-foreground font-medium mt-2">هذه الصفحة مخصصة للمشرفين فقط</p>
      </div>
    );
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, body }),
      });
      if (!res.ok) throw new Error("فشل الإرسال");
      toast({ title: "تم نشر التعميم", description: title });
      setTitle("");
      setBody("");
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    } catch {
      toast({ title: "خطأ", description: "فشل نشر التعميم", variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      toast({ title: "تم حذف التعميم" });
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    } catch {
      toast({ title: "خطأ", description: "فشل الحذف", variant: "destructive" });
    }
  };

  const handleToggleBan = async (targetUser: AdminUser) => {
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isBanned: !targetUser.isBanned }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل التحديث");
      }
      toast({ title: targetUser.isBanned ? "تم رفع الحظر عن الحساب" : "تم حظر الحساب" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast({ title: "خطأ", description: e instanceof Error ? e.message : "فشل التحديث", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-10 border-b-4 border-black pb-5">
        <div className="bg-primary text-white p-2 border-2 border-black neo-shadow">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black">لوحة الإدارة</h1>
          <p className="text-muted-foreground font-medium text-sm">إدارة المنصة والتعاميم</p>
        </div>
      </div>

      {/* Post Announcement */}
      <div className="bg-card border-4 border-black neo-shadow p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black">نشر تعميم جديد</h2>
        </div>
        <form onSubmit={handlePost} className="space-y-3">
          <div>
            <label className="text-xs font-black text-muted-foreground block mb-1">عنوان التعميم *</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثل: إشعار مهم بخصوص المنصة"
              className="border-2 border-black rounded-none neo-shadow h-11 font-bold"
              required
            />
          </div>
          <div>
            <label className="text-xs font-black text-muted-foreground block mb-1">محتوى التعميم *</label>
            <Textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="اكتب التعميم هنا..."
              className="border-2 border-black rounded-none neo-shadow font-medium resize-none"
              rows={4}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={posting || !title.trim() || !body.trim()}
            className="w-full h-12 border-2 border-black rounded-none neo-shadow font-black text-base"
          >
            <Plus className="w-4 h-4 ml-2" />
            {posting ? "جاري النشر..." : "نشر التعميم"}
          </Button>
        </form>
      </div>

      {/* User Management */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-black">إدارة المستخدمين</h2>
        </div>
        {isLoadingUsers ? (
          <div className="text-center py-10 border-4 border-black bg-muted">
            <p className="font-bold">جاري التحميل...</p>
          </div>
        ) : !users?.length ? (
          <div className="text-center py-10 border-4 border-black bg-muted">
            <p className="font-bold text-muted-foreground">لا يوجد مستخدمون</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div
                key={u.id}
                className={`flex items-center justify-between gap-4 border-4 border-black neo-shadow p-4 ${u.isBanned ? "bg-destructive/10" : "bg-card"}`}
              >
                <div className="min-w-0">
                  <p className="font-black truncate">
                    {u.name || "بدون اسم"} {u.isAdmin && <span className="text-primary">(مشرف)</span>}
                  </p>
                  <p className="text-sm text-muted-foreground font-medium truncate">{u.email}</p>
                </div>
                {u.id !== user.id && (
                  <Button
                    onClick={() => handleToggleBan(u)}
                    variant={u.isBanned ? "default" : "destructive"}
                    className="border-2 border-black rounded-none neo-shadow font-bold flex-shrink-0"
                  >
                    {u.isBanned ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                        رفع الحظر
                      </>
                    ) : (
                      <>
                        <Ban className="w-4 h-4 ml-2" />
                        حظر
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Announcements List */}
      <div>
        <h2 className="text-xl font-black mb-4">التعاميم السابقة</h2>
        {isLoading ? (
          <div className="text-center py-10 border-4 border-black bg-muted">
            <p className="font-bold">جاري التحميل...</p>
          </div>
        ) : !announcements?.length ? (
          <div className="text-center py-10 border-4 border-black bg-muted">
            <p className="font-bold text-muted-foreground">لا توجد تعاميم بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-card border-4 border-black neo-shadow p-5 relative">
                <button
                  onClick={() => handleDelete(ann.id)}
                  className="absolute top-3 left-3 bg-destructive text-white border-2 border-black p-1.5 neo-shadow hover:opacity-90"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <h3 className="font-black text-lg pr-1 pl-10">{ann.title}</h3>
                <p className="text-muted-foreground text-sm mt-1 mb-3 font-medium">{new Date(ann.createdAt).toLocaleDateString("ar-JO")}</p>
                <p className="font-medium leading-relaxed whitespace-pre-wrap">{ann.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
