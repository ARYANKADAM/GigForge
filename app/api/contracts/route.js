import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
// make sure related models are registered so populates work
import "@/models/Project";
import "@/models/Bid";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  const contracts = await Contract.find({
    $or: [
      { clientId: userId },
      { clientClerkId: userId },
      { developerId: userId },
    ],
  })
    .populate("projectId", "title")
    .sort({ createdAt: -1 }).lean();

  return NextResponse.json({ contracts: JSON.parse(JSON.stringify(contracts)) });
}