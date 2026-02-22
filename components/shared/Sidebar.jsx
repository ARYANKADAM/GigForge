"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Code2, LayoutDashboard, FolderPlus, Search, FileText, MessageSquare, Star, Shield } from "lucide-react";

const clientNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/client/projects/new", label: "Post Project", icon: FolderPlus },
  { href: "/client/projects", label: "My Projects", icon: FileText },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { href: "/reviews", label: "Reviews", icon: Star },
];

const developerNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/developer/projects", label: "Browse Projects", icon: Search },
  { href: "/developer/bids", label: "My Bids", icon: FileText },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
  { href: "/reviews", label: "Reviews", icon: Star },
];

// ✅ Admin gets its own nav
const adminNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Admin Panel", icon: Shield },
  { href: "/messages", label: "Messages", icon: MessageSquare, badge: true },
];

export default function Sidebar({ role }) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Pick nav based on role
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

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-700">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-blue-400" />
          <span className="font-bold text-lg">FreelanceHub</span>
        </Link>
        <span className="text-xs text-slate-400 mt-1 block capitalize">{role} Account</span>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ href, label, icon: Icon, badge }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition",
              pathname === href
                ? "bg-blue-600 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="flex-1">{label}</span>
            {badge && unreadMessages > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                {unreadMessages}
              </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}