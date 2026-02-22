import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Project from "@/models/Project";
import Contract from "@/models/Contract";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "stats";

    if (type === "stats") {
      const [totalUsers, totalProjects, totalContracts, activeContracts] = await Promise.all([
        User.countDocuments({ isActive: true }),
        Project.countDocuments({ isActive: true }),
        Contract.countDocuments(),
        Contract.countDocuments({ status: "active" }),
      ]);

      const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).lean();
      const recentProjects = await Project.find().populate("clientId", "firstName lastName").sort({ createdAt: -1 }).limit(5).lean();

      return NextResponse.json({
        stats: { totalUsers, totalProjects, totalContracts, activeContracts },
        recentUsers,
        recentProjects,
      });
    }

    if (type === "users") {
      const users = await User.find().sort({ createdAt: -1 }).lean();
      return NextResponse.json({ users });
    }

    if (type === "projects") {
      const projects = await Project.find()
        .populate("clientId", "firstName lastName")
        .sort({ createdAt: -1 })
        .lean();
      return NextResponse.json({ projects });
    }

    if (type === "flagged") {
      const flaggedProjects = await Project.find({ isFlagged: true })
        .populate("clientId", "firstName lastName email")
        .lean();
      const bannedUsers = await User.find({ isBanned: true }).lean();
      return NextResponse.json({ flaggedProjects, bannedUsers });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Admin API error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId || sessionClaims?.metadata?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { action, targetId, targetType } = body;

    if (action === "ban_user") {
      await User.findByIdAndUpdate(targetId, { isBanned: true, isActive: false });
    }
    if (action === "unban_user") {
      await User.findByIdAndUpdate(targetId, { isBanned: false, isActive: true });
    }
    if (action === "flag_project") {
      await Project.findByIdAndUpdate(targetId, { isFlagged: true, flagReason: body.reason || "" });
    }
    if (action === "unflag_project") {
      await Project.findByIdAndUpdate(targetId, { isFlagged: false, flagReason: "" });
    }
    if (action === "remove_project") {
      await Project.findByIdAndUpdate(targetId, { isActive: false });
    }
    if (action === "set_role") {
      await User.findByIdAndUpdate(targetId, { role: body.role });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Admin action failed" }, { status: 500 });
  }
}
