import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import ProjectCard from "@/components/shared/ProjectCard";
import Link from "next/link";
import { FolderPlus, FolderOpen } from "lucide-react";

export default async function ClientProjectsPage() {
  const { userId } = await auth();
  await connectDB();

  const user = await User.findOne({ clerkId: userId }).lean();
  const query = user
    ? { $or: [{ clientClerkId: userId }, { clientId: user._id }] }
    : { clientClerkId: userId };

  const projects = await Project.find(query).sort({ createdAt: -1 }).lean();

  const openCount = projects.filter(p => p.status === "open").length;
  const activeCount = projects.filter(p => p.status === "in_progress").length;
  const completedCount = projects.filter(p => p.status === "completed").length;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Projects</h1>
          <p className="text-white/30 text-xs mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/client/projects/new">
          <button className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-all">
            <FolderPlus className="w-4 h-4" /> Post New
          </button>
        </Link>
      </div>

      {/* Stats */}
      {projects.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Open", value: openCount, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { label: "In Progress", value: activeCount, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { label: "Completed", value: completedCount, color: "text-white/40", bg: "bg-white/5", border: "border-white/10" },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-white/30 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-[#111111] border border-white/8 rounded-xl py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6 text-white/20" />
          </div>
          <p className="text-white/30 text-sm font-medium">No projects yet</p>
          <p className="text-white/15 text-xs mt-1">Post your first project to start receiving bids</p>
          <Link href="/client/projects/new">
            <button className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
              <FolderPlus className="w-3 h-3" /> Post a project
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <ProjectCard
              key={p._id.toString()}
              project={JSON.parse(JSON.stringify(p))}
              role="client"
            />
          ))}
        </div>
      )}
    </div>
  );
}