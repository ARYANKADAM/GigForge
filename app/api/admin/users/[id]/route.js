import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (clerkUser?.unsafeMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json();
  await connectDB();

  if (action === "ban") {
    await User.findByIdAndUpdate(id, { isBanned: true });
    return NextResponse.json({ success: true });
  }
  if (action === "unban") {
    await User.findByIdAndUpdate(id, { isBanned: false });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}