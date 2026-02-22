import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Bid from "@/models/Bid";
import Project from "@/models/Project";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default async function MyBidsPage() {
  const { userId } = await auth();
  await connectDB();
  const bids = await Bid.find({ developerId: userId }).sort({ createdAt: -1 }).lean();
  const projectIds = bids.map(b => b.projectId);
  const projects = await Project.find({ _id: { $in: projectIds } }).lean();
  const projectMap = Object.fromEntries(projects.map(p => [p._id.toString(), p]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Bids</h1>
      {bids.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          You haven't submitted any bids yet. <Link href="/developer/projects" className="text-blue-600 underline">Browse projects</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map(bid => {
            const project = projectMap[bid.projectId.toString()];
            return (
              <div key={bid._id.toString()} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
                <div>
                  <Link href={`/developer/projects/${bid.projectId}`} className="font-semibold text-slate-900 hover:text-blue-600">
                    {project?.title || "Project"}
                  </Link>
                  <p className="text-sm text-slate-500 mt-0.5">Your bid: <span className="font-medium text-slate-700">${bid.amount}</span> · {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</p>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-1">{bid.proposal}</p>
                </div>
                <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[bid.status]}`}>
                  {bid.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
