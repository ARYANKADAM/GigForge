import connectDB from "@/lib/db";
import Project from "@/models/Project";
import { auth } from "@clerk/nextjs/server";
import DeveloperProjectDetail from "@/components/developer/DeveloperProjectDetail";

export default async function DeveloperProjectDetailPage({ params }) {
  const { userId } = await auth();
  // params is a promise in the app router
  const { id } = await params;
  if (!id) {
    return <div className="text-center py-16">Invalid project id.</div>;
  }

  await connectDB();
  const project = await Project.findById(id).lean();
  if (!project) return <div className="text-center py-16">Project not found.</div>;

  return (
    <DeveloperProjectDetail
      project={JSON.parse(JSON.stringify(project))}
      currentUserId={userId}
    />
  );
}
