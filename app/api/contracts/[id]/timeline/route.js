import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import Notification from "@/models/Notification";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const contract = await Contract.findById(id).lean();
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // timeline may be missing due to earlier schema absence
  let timeline = contract.timeline || [];
  if ((!timeline || timeline.length === 0)) {
    // try to load from notification history as a fallback
    const notes = await Notification.find({
      link: `/contracts/${id}`,
      type: "timeline",
    })
      .sort({ createdAt: 1 })
      .lean();
    if (notes && notes.length) {
      timeline = notes.map(n => ({
        title: n.message.replace(/^New timeline update: ?/, ""),
        description: "",
        date: n.createdAt,
        createdBy: n.userId,
        status: "pending",
      }));
    }
  }
  return NextResponse.json({ timeline });
}

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

  const contract = await Contract.findById(id).lean();
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isClient = contract.clientId === userId || contract.clientClerkId === userId;
  const isDeveloper = contract.developerId === userId;
  if (!isClient && !isDeveloper) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, date } = await req.json();
  if (!title) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  const entry = {
    title,
    description: description || "",
    date: date ? new Date(date) : new Date(),
    createdBy: userId,
    status: "pending",
  };

  // push onto timeline and return the updated document
  const updateResult = await Contract.findByIdAndUpdate(id, { $push: { timeline: entry } });
  if (!updateResult) {
    console.error("Failed to push timeline entry for contract", id);
  }

  // notify other participant of update
  const receiverId = isClient ? contract.developerId : (contract.clientClerkId || contract.clientId);
  try {
    await Notification.create({
      userId: receiverId,
      message: `New timeline update: ${title}`,
      type: "timeline",
      link: `/contracts/${id}`,
    });
  } catch (err) {
    // if enum wasn't updated yet, write raw to collection to avoid failure
    if (err.name === "ValidationError" && err.errors?.type) {
      await Notification.collection.insertOne({
        userId: receiverId,
        message: `New timeline update: ${title}`,
        type: "timeline",
        link: `/contracts/${id}`,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      throw err;
    }
  }

  // fetch new timeline so frontend can re-render immediately
  const updated = await Contract.findById(id).lean();
  let timeline = updated?.timeline || [];
  if ((!timeline || timeline.length === 0)) {
    const notes = await Notification.find({
      link: `/contracts/${id}`,
      type: "timeline",
    })
      .sort({ createdAt: 1 })
      .lean();
    if (notes && notes.length) {
      timeline = notes.map(n => ({
        title: n.message.replace(/^New timeline update: ?/, ""),
        description: "",
        date: n.createdAt,
        createdBy: n.userId,
        status: "pending",
      }));
    }
  }
  return NextResponse.json({ entry, timeline });
}
