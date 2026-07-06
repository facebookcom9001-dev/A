import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, LogOut, User, MessageCircle, Menu, X, Briefcase, Home, Rocket, Search, Handshake, Pencil, Shield, Sun, Moon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SECTIONS } from "@/lib/constants";
import { EditProfileDialog } from "@/components/EditProfileDialog";

const sectionIcons: Record<string, React.ReactNode> = {
  marketplace: <ShoppingBag className="w-4 h-4" />,
  jobs: <Briefcase className="w-4 h-4" />,
  roommates: <Home className="w-4 h-4" />,
  startups: <Rocket className="w-4 h-4" />,
  lost_found: <Search className="w-4 h-4" />,
  borrow: <Handshake className="w-4 h-4" />,
};

export function Navbar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <nav className="sticky top-0 z-50 w-full border-b-4 border-black bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-primary text-white p-2 border-2 border-black neo-shadow group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-black tracking-tight font-display">Uni Shop</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex gap-1 items-center">
          {SECTIONS.map(s => (
            <Link
              key={s.value}
              href={s.path}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bold text-sm transition-colors border-2 ${
                isActive(s.path)
                  ? "border-black bg-primary text-white"
                  : "border-transparent hover:border-black hover:bg-accent/20"
              }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="تبديل الوضع الداكن"
            className="p-2 border-2 border-black bg-card hover:bg-accent/20 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <Link href="/messages" className={`relative p-2 border-2 transition-colors ${isActive("/messages") ? "border-black bg-primary text-white" : "border-black bg-card hover:bg-accent/20"}`}>
            <MessageCircle className="w-5 h-5" />
          </Link>

          <Button asChild className="neo-shadow rounded-none border-2 border-black font-bold hidden sm:flex">
            <Link href="/sell">
              <Plus className="h-4 w-4 ml-1" />
              أضف إعلان
            </Link>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 border-2 border-black neo-shadow p-2 bg-card hover:bg-accent/20 transition-colors">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-7 h-7 object-cover border border-black" />
                  ) : (
                    <div className="w-7 h-7 bg-primary flex items-center justify-center border border-black">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="font-black text-sm hidden sm:block max-w-[80px] truncate">{user.name}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="border-2 border-black rounded-none min-w-[200px]">
                <div className="px-3 py-2 border-b-2 border-black">
                  <p className="font-black text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground font-bold truncate">{user.university}</p>
                </div>
                <DropdownMenuItem asChild className="font-bold cursor-pointer rounded-none">
                  <Link href={`/sellers/${user.id}`}>
                    <User className="w-4 h-4 ml-2" />
                    ملفي الشخصي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setEditProfileOpen(true)}
                  className="font-bold cursor-pointer rounded-none"
                >
                  <Pencil className="w-4 h-4 ml-2" />
                  تعديل ملفي الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-bold cursor-pointer rounded-none">
                  <Link href="/messages">
                    <MessageCircle className="w-4 h-4 ml-2" />
                    رسائلي
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="font-bold cursor-pointer rounded-none sm:hidden">
                  <Link href="/sell">
                    <Plus className="w-4 h-4 ml-2" />
                    أضف إعلان
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <>
                    <DropdownMenuSeparator className="bg-black/20" />
                    <DropdownMenuItem asChild className="font-bold cursor-pointer rounded-none text-primary">
                      <Link href="/admin">
                        <Shield className="w-4 h-4 ml-2" />
                        لوحة الإدارة
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-black/20" />
                <DropdownMenuItem
                  onClick={logout}
                  className="font-bold text-destructive cursor-pointer rounded-none"
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {editProfileOpen && <EditProfileDialog open={editProfileOpen} onClose={() => setEditProfileOpen(false)} />}

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden border-2 border-black p-2 bg-card"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile sections menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t-4 border-black bg-background p-4 grid grid-cols-3 gap-2">
          {SECTIONS.map(s => (
            <Link
              key={s.value}
              href={s.path}
              onClick={() => setMobileOpen(false)}
              className={`flex flex-col items-center gap-1 p-2 border-2 border-black font-bold text-xs text-center transition-colors ${
                isActive(s.path) ? "bg-primary text-white" : "bg-card hover:bg-accent/20"
              }`}
            >
              <span className="text-lg">{s.emoji}</span>
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
