import { useRef, useState } from "react";
import { User, Upload, Link as LinkIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AvatarUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

function resizeImageToBase64(file: File, maxSize = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarUploader({ value, onChange }: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value.startsWith("data:") ? "" : value);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    setLoading(true);
    try {
      const base64 = await resizeImageToBase64(file, 300);
      onChange(base64);
    } catch {
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUrlApply = () => {
    onChange(urlInput.trim());
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 border-4 border-black bg-primary flex items-center justify-center overflow-hidden flex-shrink-0 relative">
          {value ? (
            <>
              <img
                src={value}
                alt="avatar"
                className="w-full h-full object-cover"
                onError={() => onChange("")}
              />
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-0 right-0 bg-destructive text-white p-0.5 border-b-2 border-l-2 border-black"
              >
                <X className="w-3 h-3" />
              </button>
            </>
          ) : (
            <User className="w-10 h-10 text-white" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          {/* Mode toggle */}
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-black border-2 border-black transition-colors ${mode === "upload" ? "bg-primary text-white" : "bg-card hover:bg-accent/20"}`}
            >
              <Upload className="w-3 h-3" /> من الجهاز
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-black border-2 border-black transition-colors ${mode === "url" ? "bg-primary text-white" : "bg-card hover:bg-accent/20"}`}
            >
              <LinkIcon className="w-3 h-3" /> رابط
            </button>
          </div>

          {mode === "upload" ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="h-9 border-2 border-black rounded-none neo-shadow font-bold text-sm w-full"
              >
                {loading ? "جاري التحميل..." : "اختر صورة من جهازك"}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP — يتم ضغطها تلقائياً</p>
            </div>
          ) : (
            <div className="flex gap-1">
              <Input
                type="url"
                placeholder="https://..."
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                className="border-2 border-black rounded-none h-9 text-sm"
                dir="ltr"
              />
              <Button
                type="button"
                onClick={handleUrlApply}
                className="h-9 border-2 border-black rounded-none neo-shadow font-bold px-3 text-sm flex-shrink-0"
              >
                تطبيق
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
