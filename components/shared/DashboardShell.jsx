"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardShell({ role, user, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef(null);

  // close sidebar when navigating (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // click anywhere outside sidebar should close it
  useEffect(() => {
    const handler = (e) => {
      if (!sidebarOpen) return;
      // if click is inside sidebar do nothing
      if (sidebarRef.current && sidebarRef.current.contains(e.target)) return;
      // also ignore clicks on the menu button
      if (e.target.closest('.menu-button')) return;
      setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(o => !o);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* sidebar (slides in on mobile) */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed inset-y-0 left-0 z-30 w-60 bg-[#0d0d0d] border-r border-white/5 flex-shrink-0 transform transition-transform duration-200",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:flex"
        )}
      >
        <Sidebar role={role} />
      </aside>

      {/* main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onMenuClick={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-6 main-scroll">
          {children}
        </main>
      </div>
    </div>
  );
}
