import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, Tag, Users } from "lucide-react";

const STATUS_BADGE = {
  open: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-slate-100 text-slate-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ProjectCard({ project, role }) {
  const href = role === "client" ? `/client/projects/${project._id}` : `/developer/projects/${project._id}`;

  return (
    <Link href={href}>
      <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-300 transition cursor-pointer h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGE[project.status] || STATUS_BADGE.open}`}>
            {project.status.replace("_", " ")}
          </span>
          <span className="text-xs text-slate-400">{formatDate(project.createdAt)}</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2 flex-1">{project.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.skills?.slice(0, 3).map(s => (
            <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 text-green-600 font-semibold">
            <DollarSign className="h-4 w-4" />
            {formatCurrency(project.budget ?? project.budgetMin ?? 0)}
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Users className="h-4 w-4" />
            <span>{project.bidsCount || 0} bids</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
