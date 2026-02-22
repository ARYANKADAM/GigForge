import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Bid from "@/models/Bid";
import Project from "@/models/Project";
import Contract from "@/models/Contract";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { generateRoomId } from "@/lib/utils";
import { sendEmail, bidAcceptedEmail } from "@/lib/resend";

export async function PATCH(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { action } = await req.json();
  await connectDB();

  const { id } = await params;
  const bid = await Bid.findById(id);
  if (!bid) return NextResponse.json({ error: "Bid not found" }, { status: 404 });

  const project = await Project.findById(bid.projectId);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const userRecord = await User.findOne({ clerkId: userId }).lean();
  const isOwner =
    project.clientClerkId === userId ||
    project.clientId === userId ||
    (userRecord && project.clientId?.toString() === userRecord._id.toString());
  if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (action === "accept") {
    await Bid.updateMany({ projectId: bid.projectId, _id: { $ne: bid._id } }, { status: "rejected" });
    await Bid.findByIdAndUpdate(bid._id, { status: "accepted" });
    await Project.findByIdAndUpdate(bid.projectId, {
      status: "in_progress",
      selectedBidId: bid._id,
      selectedDeveloperId: bid.developerId,
    });

    const roomId = generateRoomId(userId, bid.developerId, bid.projectId.toString());
    const contract = await Contract.create({
      projectId: bid.projectId,
      bidId: bid._id,
      clientId: userId,
      developerId: bid.developerId,
      agreedAmount: bid.amount,
      deliveryDays: bid.deliveryDays,
      roomId,
    });

    // ✅ Notification inside the function
    await Notification.create({
      userId: bid.developerId,
      message: `Your bid of $${bid.amount} was accepted on "${project.title}"!`,
      type: "bid_accepted",
      link: `/contracts`,
    });

    // Email developer
    const devUser = await User.findOne({ clerkId: bid.developerId });
    if (devUser?.email) {
      await sendEmail({
        to: devUser.email,
        subject: `Your bid was accepted on "${project.title}"!`,
        html: bidAcceptedEmail(devUser.name, project.title, bid.amount),
      });
    }

    return NextResponse.json({ bid: JSON.parse(JSON.stringify(bid)), contract: JSON.parse(JSON.stringify(contract)) });
  }

  if (action === "reject") {
    await Bid.findByIdAndUpdate(bid._id, { status: "rejected" });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}