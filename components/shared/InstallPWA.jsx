"use client";
import { useState, useEffect } from "react";
import { Download, Monitor, Smartphone } from "lucide-react";

// variant: "navbar" = small compact button
// variant: "hero"   = larger with subtitle, shown in hero section
export default function InstallPWA({ variant = "hero" }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState("unknown");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "desktop");

    // Already running as installed PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // If a global deferred prompt was captured earlier (e.g. by a top-level listener), use it
    if (window.__deferredPWA) {
      setDeferredPrompt(window.__deferredPWA);
      setIsInstallable(true);
    }
    // Also listen for a custom event in case the global was set after mount
    const availHandler = () => {
      if (window.__deferredPWA) {
        setDeferredPrompt(window.__deferredPWA);
        setIsInstallable(true);
      }
    };
    window.addEventListener('pwa-available', availHandler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener('pwa-available', availHandler);
    }
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  }

  // Already installed — show nothing
  if (isInstalled) return null;

  // iOS — manual instructions (only show in hero, too verbose for navbar)
  if (platform === "ios" && variant === "hero") {
    return (
      <div className="relative group inline-block">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-sm font-medium transition-all">
          <Smartphone className="w-4 h-4" />
          Add to Home Screen
        </button>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-xs text-white/60 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-2xl z-50">
          <p className="text-white/90 font-semibold mb-2">Install on iPhone:</p>
          <p className="mb-1">1. Tap the <span className="text-white font-medium">Share</span> button ↑</p>
          <p className="mb-1">2. Tap <span className="text-white font-medium">"Add to Home Screen"</span></p>
          <p>3. Tap <span className="text-white font-medium">Add</span></p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a1a1a]" />
        </div>
      </div>
    );
  }

  // Not installable yet (prompt not fired) — show nothing
  if (!isInstallable) return null;

  const label = platform === "desktop" ? "Install App" : "Install on Android";
  const Icon = platform === "desktop" ? Monitor : Smartphone;

  // ── Navbar variant — small, minimal ──────────────────────────────────────
  if (variant === "navbar") {
    return (
      <button
        onClick={handleInstall}
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-medium transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        Install
      </button>
    );
  }

  // ── Hero variant — prominent ──────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleInstall}
        className="group flex items-center gap-2.5 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-sm font-medium transition-all"
      >
        <Icon className="w-4 h-4" />
        {label}
        <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
      </button>
      <p className="text-white/20 text-xs">
        {platform === "desktop"
          ? "Works on Chrome, Edge & Brave"
          : "Installs like a native app — no Play Store needed"}
      </p>
    </div>
  );
}