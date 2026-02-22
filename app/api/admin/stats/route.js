import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Contract from "@/models/Contract";
import Review from "@/models/Review";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clerkUser = await currentUser();
  if (clerkUser?.unsafeMetadata?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();

  const [totalUsers, totalProjects, totalContracts, totalReviews, bannedUsers, activeContracts, completedContracts] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Contract.countDocuments(),
    Review.countDocuments(),
    User.countDocuments({ isBanned: true }),
    Contract.countDocuments({ status: "active" }),
    Contract.countDocuments({ status: "completed" }),
  ]);

  const revenue = await Contract.aggregate([
    { $match: { escrowStatus: "released" } },
    { $group: { _id: null, total: { $sum: "$agreedAmount" } } },
  ]);

  return NextResponse.json({
    totalUsers,
    totalProjects,
    totalContracts,
    totalReviews,
    bannedUsers,
    activeContracts,
    completedContracts,
    totalRevenue: revenue[0]?.total || 0,
  });
}