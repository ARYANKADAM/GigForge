import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  await connectDB();
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 }).limit(20).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(notifications)));
}

export async function PATCH() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return NextResponse.json({ success: true });
}