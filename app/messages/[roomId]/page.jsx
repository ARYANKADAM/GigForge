import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import User from "@/models/User";
import Message from "@/models/Message";
import ChatWindow from "@/components/shared/ChatWindow";

export default async function ChatRoomPage({ params }) {
  const { userId } = await auth();
  if (!userId) return <div className="text-center py-16">Unauthorized</div>;

  const { roomId } = await params;
  if (!roomId) return <div className="text-center py-16">No room specified.</div>;

  await connectDB();

  const contract = await Contract.findOne({ roomId }).lean();
  if (!contract) return <div className="text-center py-16">Conversation not found.</div>;

  // clientId in your DB is already a Clerk user ID string
  const isParticipant =
    contract.developerId === userId ||
    contract.clientClerkId === userId ||
    contract.clientId === userId;

  if (!isParticipant) return <div className="text-center py-16">Forbidden</div>;

  // Find the other user
  const otherClerkId = contract.clientId === userId
    ? contract.developerId
    : contract.clientId;

  const otherUser = await User.findOne({ clerkId: otherClerkId }).lean();

  const initialMessages = await Message.find({ roomId }).sort({ createdAt: 1 }).lean();

  return (
    <ChatWindow
      roomId={roomId}
      currentUserId={userId}
      initialMessages={JSON.parse(JSON.stringify(initialMessages))}
      otherUser={otherUser ? JSON.parse(JSON.stringify(otherUser)) : null}
    />
  );
}