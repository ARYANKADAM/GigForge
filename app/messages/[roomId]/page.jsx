import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import User from "@/models/User";
import Message from "@/models/Message";
import Notification from "@/models/Notification";
import ChatWindow from "@/components/shared/ChatWindow";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

export default async function ChatRoomPage({ params }) {
  const { userId } = await auth();
  if (!userId) return <div className="text-center py-16 text-white">Unauthorized</div>;

  // params can be a Promise in App Router; unwrap it before accessing
  const { roomId } = await params;
  if (!roomId) return <div className="text-center py-16 text-white">No room specified.</div>;

  await connectDB();
  // mark message notifications read (user is in a particular conversation)
  try {
    await Notification.updateMany({ userId, type: "message", isRead: false }, { isRead: true });
  } catch (e) {
    console.error("Failed to clear message notifications", e);
  }

  const contract = await Contract.findOne({ roomId }).lean();
  if (!contract) return <div className="text-center py-16 text-white">Conversation not found.</div>;

  const isParticipant =
    contract.developerId === userId ||
    contract.clientClerkId === userId ||
    contract.clientId === userId;

  if (!isParticipant) return <div className="text-center py-16 text-white">Forbidden</div>;

  const otherClerkId = contract.clientId === userId
    ? contract.developerId
    : contract.clientId;

  const otherUser = await User.findOne({ clerkId: otherClerkId }).lean();
  const initialMessages = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();

  // Fetch all conversations for sidebar
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
      const oclerkId = isClient ? c.developerId : (c.clientClerkId || c.clientId);
      const other = userMap[oclerkId] || null;
      const lastMsg = await Message.findOne({ roomId: c.roomId }).sort({ createdAt: -1 }).lean();
      return { roomId: c.roomId, other, lastMsg };
    })
  );

  return (
    <div className="h-screen flex flex-col md:flex-row">

      {/* Contacts Sidebar */}
      <div className="hidden md:flex md:w-80 md:border-r md:border-white/5 flex-col bg-[#0d0d0d] shrink-0">

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
      </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {rooms.filter(r => r.roomId).map((r) => {
            const isActive = r.roomId === roomId;
            return (
              <Link key={r.roomId} href={`/messages/${r.roomId}`}>
                <div className={`flex items-center gap-3 px-4 py-3.5 transition-colors border-b border-white/10 cursor-pointer group ${
                  isActive ? "bg-white/8" : "hover:bg-white/5"
                }`}>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-medium truncate transition-colors ${isActive ? "text-white" : "text-white/70 group-hover:text-white"}`}>
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
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* back button for mobile */}
        <div className="md:hidden px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
          <Link href="/messages" className="inline-flex items-center gap-2 text-sm text-white hover:underline">
            ← Back
          </Link>
        </div>
        <ChatWindow
          roomId={roomId}
          currentUserId={userId}
          initialMessages={JSON.parse(JSON.stringify(initialMessages))}
          otherUser={otherUser ? JSON.parse(JSON.stringify(otherUser)) : null}
        />
      </div>
    </div>
  );
}