import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const project = await Project.findById(id).lean();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // ✅ Fix: check both clientClerkId and MongoDB _id via User lookup
  const user = await User.findOne({ clerkId: userId });
  const isOwner =
    project.clientClerkId === userId ||
    (user && project.clientId?.toString() === user._id.toString());

  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates = await req.json();
  const updated = await Project.findByIdAndUpdate(id, updates, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { id } = await params;
  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await User.findOne({ clerkId: userId });
  const isOwner =
    project.clientClerkId === userId ||
    (user && project.clientId?.toString() === user._id.toString());

  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Project.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}