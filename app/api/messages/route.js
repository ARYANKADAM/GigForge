import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";
import Contract from "@/models/Contract";
import Notification from "@/models/Notification";

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId) return NextResponse.json({ error: "roomId required" }, { status: 400 });

  await connectDB();

  const contract = await Contract.findOne({ roomId }).lean();
  if (!contract) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const isClient = contract.clientId === userId || contract.clientClerkId === userId;
  const isDeveloper = contract.developerId === userId;

  if (!isClient && !isDeveloper) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await Message.find({ roomId }).sort({ createdAt: 1 }).limit(200).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(messages)));
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user;
  try {
    user = await currentUser();
  } catch (err) {
    console.error("messages POST: failed to fetch currentUser", err);
    return NextResponse.json({ error: "Unable to fetch user info" }, { status: 500 });
  }
  const { roomId, content, type = "text", fileUrl } = await req.json();

  await connectDB();

  const contract = await Contract.findOne({ roomId }).lean();
  if (!contract) return NextResponse.json({ error: "Room not found" }, { status: 404 });

  const isClient = contract.clientId === userId || contract.clientClerkId === userId;
  const isDeveloper = contract.developerId === userId;

  if (!isClient && !isDeveloper) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await Message.create({
    roomId,
    senderId: userId,
    senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    senderImage: user.imageUrl,
    content,
    type,
    fileUrl,
  });

  // Notify the other participant
  const receiverId = isClient ? contract.developerId : (contract.clientClerkId || contract.clientId);
  
  await Notification.create({
    userId: receiverId,
    message: `New message from ${user.firstName || "Someone"}: "${content.slice(0, 60)}${content.length > 60 ? "..." : ""}"`,
    type: "message",
    link: `/messages/${roomId}`,
  });

  // Emit via socket for real-time delivery
  if (global.io) {
    global.io.to(roomId).emit("receive_message", JSON.parse(JSON.stringify(message)));
  }

  return NextResponse.json(JSON.parse(JSON.stringify(message)), { status: 201 });
}