import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import User from "@/models/User";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import { formatDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export default async function MessagesIndexPage() {
  const { userId } = await auth();
  if (!userId) return <div className="text-center py-16">Unauthorized</div>;

  await connectDB();
  // clear any unread message notifications since user is viewing messages
  try {
    await Notification.updateMany({ userId, type: "message", isRead: false }, { isRead: true });
  } catch (e) {
    console.error("Failed to clear message notifications", e);
  }

  const contracts = await Contract.find({
    $or: [
      { clientId: userId },
      { clientClerkId: userId },
      { developerId: userId },
    ],
  }).sort({ updatedAt: -1 }).lean();

  const otherClerkIds = contracts.map(c => {
    const isClient = c.clientId === userId || c.clientClerkId === userId;
    return isClient ? c.developerId : (c.clientClerkId || c.clientId);
  }).filter(Boolean);

  const otherUsers = await User.find({ clerkId: { $in: otherClerkIds } }).lean();
  const userMap = Object.fromEntries(otherUsers.map(u => [u.clerkId, u]));

  const rooms = await Promise.all(
    contracts.map(async (c) => {
      const isClient = c.clientId === userId || c.clientClerkId === userId;
      const otherClerkId = isClient ? c.developerId : (c.clientClerkId || c.clientId);
      const other = userMap[otherClerkId] || null;
      const lastMsg = await Message.findOne({ roomId: c.roomId }).sort({ createdAt: -1 }).lean();
      return { roomId: c.roomId, other, lastMsg };
    })
  );

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row">

      {/* Contacts Sidebar */}
      <div className="w-full md:w-80 md:border-r md:border-white/5 flex flex-col bg-[#0d0d0d]">

       {/* Header */}
<div className="px-4 py-4 border-b border-white/5">
  <div className="flex items-center gap-2 mb-3">
    <Link href="/dashboard">
      <button className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-all">
        <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </Link>
    <h1 className="text-base font-bold text-white">Messages</h1>
  </div>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/8 rounded-lg text-xs text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/30 text-xs">No conversations yet</p>
            </div>
          ) : (
            rooms.filter(r => r.roomId).map((r) => (
              <Link key={r.roomId} href={`/messages/${r.roomId}`}>
                <div className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-white/10 cursor-pointer group">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {r.other?.imageUrl ? (
                      <img src={r.other.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/60 text-sm">
                        {r.other?.name?.[0] || "?"}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0d0d0d]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                        {r.other?.name || "Unknown User"}
                      </p>
                      {r.lastMsg && (
                        <span className="text-xs text-white/20 shrink-0 ml-2">
                          {formatDate(r.lastMsg.createdAt)}
                        </span>
                      )}
                    </div>
                    {r.lastMsg ? (
                      <p className="text-xs text-white/25 truncate">{r.lastMsg.content}</p>
                    ) : (
                      <p className="text-xs text-white/15 italic">No messages yet</p>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Empty state — when no room is selected (hidden on small) */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <MessageSquare className="w-7 h-7 text-white/20" />
        </div>
        <p className="text-white/30 text-sm font-medium">Select a conversation</p>
        <p className="text-white/15 text-xs mt-1">Choose from your contacts on the left</p>
      </div>
    </div>
  );
}