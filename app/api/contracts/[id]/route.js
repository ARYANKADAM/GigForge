import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import Project from "@/models/Project";

export async function GET(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // params is a Promise in app router dynamic API routes
  const { id } = await params;

  await connectDB();
  const contract = await Contract.findById(id).lean();
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (contract.clientId !== userId && contract.developerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(contract);
}

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  await connectDB();

  const { id } = await params;
  const contract = await Contract.findById(id);
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "complete") {
    if (contract.clientId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await Contract.findByIdAndUpdate(id, { status: "completed", completedAt: new Date() });
    await Project.findByIdAndUpdate(contract.projectId, { status: "completed" });
    return NextResponse.json({ success: true });
  }

  if (action === "dispute") {
    await Contract.findByIdAndUpdate(id, { status: "disputed" });
    await Project.findByIdAndUpdate(contract.projectId, { status: "disputed" });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
