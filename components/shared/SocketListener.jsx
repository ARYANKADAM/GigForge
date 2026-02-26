"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket-client";
import { useToast } from "@/hooks/use-toast";

export default function SocketListener() {
  const { toast } = useToast();

  useEffect(() => {
    const socket = getSocket();
    // Capture PWA install prompt early so UI components mounted later
    // (like `InstallPWA`) can still access it even if the event fired already.
    function handleBeforeInstallPrompt(e) {
      e.preventDefault();
      try { window.__deferredPWA = e } catch (err) { }
      try { window.dispatchEvent(new CustomEvent('pwa-available')) } catch (err) { }
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      try { window.__deferredPWA = null } catch (err) { }
      try { window.dispatchEvent(new CustomEvent('pwa-installed')) } catch (err) { }
    });
    // Register a simple service worker so Chrome can consider the site a PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        console.log('Service worker registered:', reg.scope);
      }).catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
    }
    function handleNewMessage(msg) {
      // show a toast for new message
      toast({
        title: "New message",
        description: msg.content,
      });
    }
    function handleBidNotification(data) {
      toast({ title: "New bid", description: data.projectTitle });
    }
    function handlePaymentNotification(data) {
      toast({ title: "Payment update", description: data.info || "" });
    }

    socket.on("notification:message", handleNewMessage);
    socket.on("notification:bid", handleBidNotification);
    socket.on("notification:payment", handlePaymentNotification);

    return () => {
      socket.off("notification:message", handleNewMessage);
      socket.off("notification:bid", handleBidNotification);
      socket.off("notification:payment", handlePaymentNotification);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [toast]);

  return null;
}
