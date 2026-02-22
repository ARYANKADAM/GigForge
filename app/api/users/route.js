import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let clerkUser;
    try {
      clerkUser = await currentUser();
    } catch (err) {
      console.error("users POST: failed to fetch currentUser", err);
      return NextResponse.json({ error: "Unable to fetch user info" }, { status: 500 });
    }

    const { role } = await req.json();

    await connectDB();
   const user = await User.findOneAndUpdate(
  { clerkId: userId },
  {
    clerkId: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
    imageUrl: clerkUser.imageUrl,
    role, // ✅ "admin" will be saved here
  },
  { upsert: true, new: true, lean: true }
);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  return NextResponse.json(user);
}
