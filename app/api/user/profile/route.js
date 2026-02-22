import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ clerkId: userId }).lean();
  return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
}

export async function PUT(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const body = await req.json();
    const allowedFields = ["firstName", "lastName", "bio", "skills", "hourlyRate", "location", "website", "portfolioUrl", "role"];
    const update = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) update[field] = body[field];
    });

    const user = await User.findOneAndUpdate({ clerkId: userId }, update, { new: true }).lean();
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
