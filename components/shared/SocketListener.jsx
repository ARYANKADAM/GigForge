"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket-client";
import { useToast } from "@/hooks/use-toast";

export default function SocketListener() {
  const { toast } = useToast();

  useEffect(() => {
    const socket = getSocket();
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
    };
  }, [toast]);

  return null;
}
