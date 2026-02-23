import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Bid from "@/models/Bid";
import Project from "@/models/Project";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText, Search } from "lucide-react";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default async function MyBidsPage() {
  const { userId } = await auth();
  await connectDB();
  const bids = await Bid.find({ developerId: userId }).sort({ createdAt: -1 }).lean();
  const projectIds = bids.map(b => b.projectId);
  const projects = await Project.find({ _id: { $in: projectIds } }).lean();
  const projectMap = Object.fromEntries(projects.map(p => [p._id.toString(), p]));

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">My Bids</h1>
        <p className="text-white/30 text-xs mt-0.5">
          {bids.length} bid{bids.length !== 1 ? "s" : ""} submitted
        </p>
      </div>

      {bids.length === 0 ? (
        <div className="bg-[#111111] border border-white/8 rounded-xl py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-white/40 text-sm font-medium">No bids yet</p>
          <p className="text-white/20 text-xs mt-1">Start bidding on projects to earn money</p>
          <Link
            href="/developer/projects"
            className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
          >
            <Search className="w-3 h-3" /> Browse projects
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map(bid => {
            const project = projectMap[bid.projectId.toString()];
            return (
              <div
                key={bid._id.toString()}
                className="bg-[#111111] border border-white/8 rounded-xl p-5 flex items-center justify-between gap-4 hover:border-white/15 transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-white/30" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/developer/projects/${bid.projectId}`}
                      className="font-semibold text-white/80 hover:text-white text-sm transition-colors line-clamp-1"
                    >
                      {project?.title || "Project"}
                    </Link>
                    <p className="text-white/30 text-xs mt-0.5">
                      Bid: <span className="text-white/60 font-medium">${bid.amount}</span>
                      <span className="mx-1.5 text-white/15">·</span>
                      {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                    </p>
                    <p className="text-white/20 text-xs mt-1 line-clamp-1">{bid.proposal}</p>
                  </div>
                </div>
                <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${STATUS_STYLES[bid.status]}`}>
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