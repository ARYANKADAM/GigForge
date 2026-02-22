import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";

export async function GET(req, { params }) {
  await connectDB();
  const project = await Project.findById(params.id).lean();
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const project = await Project.findById(params.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updates = await req.json();
  const updated = await Project.findByIdAndUpdate(params.id, updates, { new: true });
  return NextResponse.json(updated);
}

export async function DELETE(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const project = await Project.findById(params.id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await Project.findByIdAndDelete(params.id);
  return NextResponse.json({ success: true });
}
