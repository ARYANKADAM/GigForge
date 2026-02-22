import connectDB from "@/lib/db";
import Project from "@/models/Project";
import ProjectCard from "@/components/shared/ProjectCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["All", "Web Development", "Mobile App", "UI/UX Design", "Data Science", "DevOps", "Blockchain", "Other"];

export default async function BrowseProjectsPage({ searchParams }) {
  await connectDB();
  const query = {};
  if (searchParams.category && searchParams.category !== "All") query.category = searchParams.category;
  if (searchParams.search) query.title = { $regex: searchParams.search, $options: "i" };
  query.status = "open";

  const projects = await Project.find(query).sort({ createdAt: -1 }).limit(50).lean();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
        <p className="text-slate-500 mt-1">Find your next opportunity</p>
      </div>
      <div className="flex gap-4 mb-6">
        <form className="flex gap-3 flex-1">
          <Input name="search" placeholder="Search projects..." defaultValue={searchParams.search} className="max-w-sm" />
          <Select name="category" defaultValue={searchParams.category || "All"}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Filter</button>
        </form>
      </div>
      {projects.length === 0 ? (
        <div className="text-center py-16 text-slate-400">No projects found. Try different filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => <ProjectCard key={p._id.toString()} project={JSON.parse(JSON.stringify(p))} role="developer" />)}
        </div>
      )}
    </div>
  );
}
