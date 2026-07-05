import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JORDANIAN_UNIVERSITIES } from "@/lib/constants";
import { User } from "lucide-react";
import { AvatarUploader } from "@/components/AvatarUploader";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function EditProfileDialog({ open, onClose }: Props) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? "");
  const [university, setUniversity] = useState(user?.university ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !university) return;
    setLoading(true);
    try {
      await updateProfile({
        name: name.trim(),
        university,
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
      });
      toast({ title: "تم التحديث", description: "تم تحديث ملفك الشخصي بنجاح" });
      onClose();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="border-4 border-black rounded-none neo-shadow max-w-md w-full p-0 gap-0">
        <DialogHeader className="bg-primary p-5 border-b-4 border-black">
          <DialogTitle className="text-white font-black text-xl flex items-center gap-2">
            <User className="w-5 h-5" /> تعديل الملف الشخصي
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-black text-muted-foreground block mb-2">الصورة الشخصية</label>
            <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />
          </div>

          <div>
            <label className="text-xs font-black text-muted-foreground block mb-1">الاسم الكامل *</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              className="border-2 border-black rounded-none neo-shadow h-11 font-bold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-black text-muted-foreground block mb-1">الجامعة *</label>
            <Select value={university} onValueChange={setUniversity}>
              <SelectTrigger className="border-2 border-black rounded-none neo-shadow h-11 font-bold">
                <SelectValue placeholder="اختر جامعتك" />
              </SelectTrigger>
              <SelectContent className="border-2 border-black rounded-none max-h-64">
                {JORDANIAN_UNIVERSITIES.map(uni => (
                  <SelectItem key={uni} value={uni} className="font-bold cursor-pointer">{uni}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-black text-muted-foreground block mb-1">نبذة تعريفية</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="اكتب نبذة قصيرة عن نفسك..."
              rows={3}
              className="w-full border-2 border-black rounded-none neo-shadow p-3 font-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={loading || !name.trim() || !university}
              className="flex-1 h-11 border-2 border-black rounded-none neo-shadow font-black text-base"
            >
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-11 border-2 border-black rounded-none font-bold"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
