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

export async function PATCH(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  // allow callers to specify filters (type, link) so we can mark only message notifications
  let body = {};
  try {
    body = await req.json();
  } catch {}

  const query = { userId, isRead: false };
  if (body.type) query.type = body.type;
  if (body.link) query.link = body.link;

  await Notification.updateMany(query, { isRead: true });
  return NextResponse.json({ success: true });
}