"use client";
import { Bell, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

export default function TopBar({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (Array.isArray(data)) setNotifications(data);
      } catch {}
    };
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  // refresh when other components signal updates
  useEffect(() => {
    const handler = () => {
      fetch("/api/notifications")
        .then(r => r.json())
        .then(data => Array.isArray(data) && setNotifications(data))
        .catch(() => {});
    };
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <header className="bg-[#0d0d0d] border-b border-white/5 px-6 py-3.5 flex items-center justify-between">

      {/* Search */}
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
            className="relative p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Bell className="w-4 h-4 text-white/40" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* Dropdown */}
          {showNotifs && (
            <div className="absolute right-0 top-10 w-72 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/5">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-white/30 text-xs text-center py-6">No notifications</p>
                ) : (
                  notifications.slice(0, 8).map(n => (
                    <div key={n._id} className={`px-4 py-3 border-b border-white/5 last:border-0 ${!n.isRead ? "bg-white/3" : ""}`}>
                      <p className="text-xs text-white/70">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User (use Clerk UserButton so profile menu opens) */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/5">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  );
}