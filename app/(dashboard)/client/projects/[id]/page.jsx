import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import Bid from "@/models/Bid";
import User from "@/models/User";
import BidCard from "@/components/shared/BidCard";
import ProjectDetailClient from "@/components/client/ProjectDetailClient";

export default async function ClientProjectDetailPage({ params }) {
  // params is a promise in Next.js; unwrap it before reading properties
  const { id } = await params;
  if (!id) {
    return <div className="text-center py-16">Invalid project id.</div>;
  }

  await connectDB();
  const { userId } = await auth();
  if (!userId) {
    // sensitive page, redirecting to sign-in would be better, but fallback to
    // message for now
    return <div className="text-center py-16">Unauthorized</div>;
  }

  // load both the project and the local user record (for legacy lookup)
  const project = await Project.findById(id).lean();
  if (!project) {
    return <div className="text-center py-16">Project not found.</div>;
  }

  const user = await User.findOne({ clerkId: userId }).lean();
  const isOwner =
    project.clientClerkId === userId ||
    (user && project.clientId === user._id.toString());
  if (!isOwner) {
    return <div className="text-center py-16">You are not allowed to view this project.</div>;
  }

  // fetch bids – sort so newest first and include developer info already stored
  const bids = await Bid.find({ projectId: id }).sort({ createdAt: -1 }).lean();

  return (
    <ProjectDetailClient
      project={JSON.parse(JSON.stringify(project))}
      bids={JSON.parse(JSON.stringify(bids))}
      currentUserId={userId}
      isOwner={isOwner}
    />
  );
}
