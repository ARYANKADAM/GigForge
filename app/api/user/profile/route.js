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

    // ✅ Make sure location and portfolio are here
    const allowedFields = ["bio", "skills", "hourlyRate", "location", "portfolio", "role"];
    const update = {};
    allowedFields.forEach((field) => {
      if (body[field] !== undefined) update[field] = body[field];
    });

    console.log("Updating user with:", update); // ✅ debug

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: update }, // ✅ use $set explicitly
      { new: true, lean: true }
    );

    return NextResponse.json({ user: JSON.parse(JSON.stringify(user)) });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}