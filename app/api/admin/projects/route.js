import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (clerkUser?.unsafeMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const projects = await Project.find().sort({ createdAt: -1 }).limit(50).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(projects)));
}

export async function DELETE(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (clerkUser?.unsafeMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { projectId } = await req.json();
  await connectDB();
  await Project.findByIdAndDelete(projectId);
  return NextResponse.json({ success: true });
}