import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Message from "@/models/Message";

// PUT /api/messages/[id] — edit message
export async function PUT(req, context) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await Promise.resolve(context.params);
    const body = await req.json();
    const content = body?.content;
    if (!content?.trim()) return Response.json({ error: "Content required" }, { status: 400 });

    await connectDB();

    const message = await Message.findById(id);
    if (!message) return Response.json({ error: "Not found" }, { status: 404 });

    // Check both fields — schema uses senderId AND senderClerkId
    const isOwner = message.senderId === userId || message.senderClerkId === userId
    if (!isOwner) {
      console.log("[PUT] Forbidden — userId:", userId, "senderId:", message.senderId, "senderClerkId:", message.senderClerkId)
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    message.content = content.trim();
    message.edited = true;
    await message.save();

    return Response.json(message);
  } catch (err) {
    console.error("[PUT /api/messages/[id]]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/messages/[id] — delete message
export async function DELETE(req, context) {
  try {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await Promise.resolve(context.params);

    await connectDB();

    const message = await Message.findById(id);
    if (!message) return Response.json({ error: "Not found" }, { status: 404 });

    // Check both fields
    const isOwner = message.senderId === userId || message.senderClerkId === userId
    if (!isOwner) {
      console.log("[DELETE] Forbidden — userId:", userId, "senderId:", message.senderId, "senderClerkId:", message.senderClerkId)
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    await message.deleteOne();
    return Response.json({ deleted: true, id });
  } catch (err) {
    console.error("[DELETE /api/messages/[id]]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}