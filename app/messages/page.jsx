import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import User from "@/models/User";
import Message from "@/models/Message";
import { formatDate } from "@/lib/utils";

export default async function MessagesIndexPage() {
  const { userId } = await auth();
  if (!userId) return <div className="text-center py-16">Unauthorized</div>;

  await connectDB();

  const contracts = await Contract.find({
    $or: [
      { clientId: userId },
      { clientClerkId: userId },
      { developerId: userId },
    ],
  }).sort({ updatedAt: -1 }).lean();

  // For each contract, find the other participant's clerkId
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

      const lastMsg = await Message.findOne({ roomId: c.roomId })
        .sort({ createdAt: -1 }).lean();

      return { roomId: c.roomId, other, lastMsg };
    })
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      {rooms.length === 0 ? (
        <div className="text-center text-slate-500 py-16">No conversations yet.</div>
      ) : (
        <div className="space-y-3">
          {rooms.filter(r => r.roomId).map((r) => (
            <Link key={r.roomId} href={`/messages/${r.roomId}`}>
              <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 p-4 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  {r.other?.imageUrl ? (
                    <img src={r.other.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                      {r.other?.name?.[0] || "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-slate-900">
                      {r.other?.name || "Unknown User"}
                    </p>
                    {r.lastMsg && (
                      <p className="text-xs text-slate-500 truncate max-w-xs">
                        {r.lastMsg.content}
                      </p>
                    )}
                  </div>
                </div>
                {r.lastMsg && (
                  <span className="text-xs text-slate-400">{formatDate(r.lastMsg.createdAt)}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}