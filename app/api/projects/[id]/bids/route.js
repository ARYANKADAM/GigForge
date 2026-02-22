import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Bid from "@/models/Bid";
import Project from "@/models/Project";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { sendEmail, bidReceivedEmail } from "@/lib/resend";

export async function GET(req, { params }) {
  const { id } = await params;
  await connectDB();
  const bids = await Bid.find({ projectId: id }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(JSON.parse(JSON.stringify(bids)));
}

export async function POST(req, { params }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user;
  try {
    user = await currentUser();
  } catch (err) {
    console.error("project bids POST: failed to fetch currentUser", err);
    return NextResponse.json({ error: "Unable to fetch user info" }, { status: 500 });
  }
  const { amount, deliveryDays, proposal } = await req.json();
  const { id } = await params;

  await connectDB();

  const existing = await Bid.findOne({ projectId: id, developerId: userId });
  if (existing) return NextResponse.json({ error: "Already bid on this project" }, { status: 400 });

  const project = await Project.findById(id);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.status !== "open") return NextResponse.json({ error: "Project is not accepting bids" }, { status: 400 });

  const bid = await Bid.create({
    projectId: id,
    developerId: userId,
    developerName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
    developerImage: user.imageUrl,
    amount,
    deliveryDays,
    proposal,
  });

  await Project.findByIdAndUpdate(id, { $inc: { bidsCount: 1 } });

  // ✅ Notification inside the function
  await Notification.create({
    userId: project.clientId,
    message: `New bid of $${amount} received on "${project.title}"`,
    type: "bid",
    link: `/client/projects/${id}`,
  });

  // Email client
  const clientUser = await User.findOne({ clerkId: project.clientId });
  if (clientUser?.email) {
    await sendEmail({
      to: clientUser.email,
      subject: `New bid on "${project.title}"`,
      html: bidReceivedEmail(clientUser.name, project.title, bid.developerName, amount),
    });
  }

  return NextResponse.json(JSON.parse(JSON.stringify(bid)), { status: 201 });
}