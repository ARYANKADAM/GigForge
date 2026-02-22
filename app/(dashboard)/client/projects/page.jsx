import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Project from "@/models/Project";
import User from "@/models/User";
import ProjectCard from "@/components/shared/ProjectCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";

export default async function ClientProjectsPage() {
  const { userId } = await auth();
  await connectDB();

  // Get our local user record so we can also match projects that were created
  // before the `clientClerkId` field existed. Those older documents store the
  // Mongo _id in `clientId` instead of a Clerk ID.
  const user = await User.findOne({ clerkId: userId }).lean();

  const query = user
    ? { $or: [{ clientClerkId: userId }, { clientId: user._id }] }
    : { clientClerkId: userId };

  const projects = await Project.find(query).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">My Projects</h1>
        <Link href="/client/projects/new">
          <Button className="flex items-center gap-2"><FolderPlus className="h-4 w-4" />Post New</Button>
        </Link>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border text-slate-400">
          No projects yet. <Link href="/client/projects/new" className="text-blue-600 underline">Post one!</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => <ProjectCard key={p._id.toString()} project={JSON.parse(JSON.stringify(p))} role="client" />)}
        </div>
      )}
    </div>
  );
}
