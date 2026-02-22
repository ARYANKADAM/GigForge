import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (clerkUser?.unsafeMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(users)));
}