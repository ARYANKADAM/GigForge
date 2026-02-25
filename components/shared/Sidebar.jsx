"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Code2, LayoutDashboard, FolderPlus, Search, FileText, MessageSquare, Star, Shield, User } from "lucide-react";

const clientNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/projects/new", label: "Post Project", icon: FolderPlus },
  { href: "/client/projects", label: "My Projects", icon: FileText },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/profile", label: "Profile", icon: User },
];

const developerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/developer/projects", label: "Browse Projects", icon: Search },
  { href: "/developer/bids", label: "My Bids", icon: FileText },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/profile", label: "Profile", icon: User },
];

const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);

  const nav = role === "client" ? clientNav : role === "admin" ? adminNav : developerNav;

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (Array.isArray(data)) {
          setUnreadMessages(data.filter(n => !n.isRead && n.type === "message").length);
        }
      } catch {}
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // whenever the user navigates to any messages route, mark message notifs read
  useEffect(() => {
    if (pathname.startsWith("/messages")) {
      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "message" }),
      }).then(() => {
        setUnreadMessages(0);
        // notify other components (TopBar) to refresh
        window.dispatchEvent(new Event("notifications-updated"));
      }).catch(() => {});
    }
  }, [pathname]);

  return (
    <aside className="w-60 bg-[#0d0d0d] border-r border-white/5 text-white flex flex-col flex-shrink-0">

      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-.5">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <img 
    src="/icon0.svg" 
    alt="GigForge" 
    className="w-6 h-6"
    style={{ filter: "brightness(0) invert(1)" }}
  />
          </div>
          <span className="font-bold text-base text-white">GigForge</span>
        </Link>
        <span className="text-xs text-white/30 mt-2 block capitalize">
          {role} Account
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-white/40")} />
              <span className="flex-1">{label}</span>
              {badge && unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {unreadMessages}
                </span>
              )}
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-white/60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom role badge */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            role === "client" ? "bg-blue-400" :
            role === "admin" ? "bg-purple-400" : "bg-green-400"
          )} />
          <span className="text-xs text-white/30 capitalize">{role}</span>
        </div>
      </div>
    </aside>
  );
}