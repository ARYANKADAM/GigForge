"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

let socket;

export default function ChatRoom({ roomId, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    // Load history
    fetch(`/api/messages?roomId=${roomId}`)
      .then(r => r.json())
      .then(data => { setMessages(data); setLoading(false); });

    // Connect socket
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join_room", roomId);
    });
    socket.on("receive_message", (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    socket.on("user_typing", () => setTyping(true));
    socket.on("user_stop_typing", () => setTyping(false));

    return () => {
      socket.emit("leave_room", roomId);
      socket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (val) => {
    setInput(val);
    socket?.emit("typing_start", { roomId, userId: currentUserId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket?.emit("typing_stop", { roomId, userId: currentUserId });
    }, 1500);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const content = input.trim();
    setInput("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, content }),
    });
    const msg = await res.json();
    setMessages(prev => [...prev, msg]);
    socket?.emit("send_message", { ...msg, roomId });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-[#0d0d0d] rounded-xl border border-white/10 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-semibold text-slate-900">Project Chat</h2>
        <span className={`text-xs ${connected ? "text-green-500" : "text-slate-400"}`}>
          {connected ? "● Connected" : "Connecting..."}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : messages.length === 0 ? (
          <p className="text-center text-slate-400 py-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl ${isMe ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-900"}`}>
                  {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.senderName}</p>}
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 opacity-60`}>{formatDate(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-2xl px-4 py-2.5 text-sm text-slate-400 italic">typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-200 flex gap-2">
        <Input
          value={input}
          onChange={e => handleTyping(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
