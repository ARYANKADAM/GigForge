import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Contract from "@/models/Contract";
import User from "@/models/User";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  await connectDB();
  const reviews = await Review.find({ revieweeId: userId }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(reviews)));
}

export async function POST(req) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contractId, rating, comment } = await req.json();
  await connectDB();

  const contract = await Contract.findById(contractId).lean();
  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });
  if (contract.status !== "completed") return NextResponse.json({ error: "Contract not completed" }, { status: 400 });

  const isClient = contract.clientId === userId;
  const isDeveloper = contract.developerId === userId;
  if (!isClient && !isDeveloper) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Prevent double review
  const existing = await Review.findOne({ contractId, reviewerId: userId });
  if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 400 });

  const revieweeId = isClient ? contract.developerId : contract.clientId;
  const type = isClient ? "client_to_developer" : "developer_to_client";

  const review = await Review.create({
    contractId,
    projectId: contract.projectId,
    reviewerId: userId,
    revieweeId,
    rating,
    comment,
    type,
  });

  // Update reviewee's average rating
  const allReviews = await Review.find({ revieweeId });
  const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
  await User.findOneAndUpdate(
    { clerkId: revieweeId },
    { averageRating: Math.round(avg * 10) / 10, totalReviews: allReviews.length }
  );

  return NextResponse.json(JSON.parse(JSON.stringify(review)), { status: 201 });
}