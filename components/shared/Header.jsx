"use client";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { formatDate } from "@/lib/utils";
import BackButton from "./BackButton";

export default function Header() {
  const { user, isLoaded } = useUser();
  const name = isLoaded ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim() : "";
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    fetch("/api/notifications").then(r => r.json()).then(data => {
      setNotifications(data || []);
    }).catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        {/* back arrow will simply call router.back() */}
        <BackButton />
        <div>
          <p className="text-sm text-slate-500">Welcome back,</p>
          <p className="font-semibold text-slate-900">{name || "..."}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative" ref={ref}>
          <button
            onClick={() => { setOpen(!open); if (!open && unread > 0) markAllRead(); }}
            className="relative p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <Bell className="h-5 w-5 text-slate-500" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-slate-200 shadow-lg z-50">
              <div className="p-4 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Notifications</p>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-400 py-8 text-sm">No notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n._id} className={`p-4 border-b border-slate-50 ${!n.isRead ? "bg-blue-50" : ""}`}>
                      <p className="text-sm text-slate-800">{n.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}