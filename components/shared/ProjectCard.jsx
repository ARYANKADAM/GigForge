import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Users, Clock } from "lucide-react";

const STATUS_STYLES = {
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-white/5 text-white/40 border-white/10",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ProjectCard({ project, role }) {
  const href = role === "client"
    ? `/client/projects/${project._id}`
    : `/developer/projects/${project._id}`;

  return (
    <Link href={href}>
      <div className="bg-[#111111] border border-white/8 rounded-xl p-5 hover:border-white/20 transition-all cursor-pointer h-full flex flex-col group">

        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[project.status] || STATUS_STYLES.open}`}>
            {project.status?.replace("_", " ")}
          </span>
          <span className="text-xs text-white/20 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(project.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white/80 group-hover:text-white text-sm mb-2 line-clamp-2 transition-colors flex-1">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-white/30 text-xs line-clamp-2 mb-4 leading-relaxed">
          {project.description}
        </p>

        {/* Skills */}
        {project.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.skills.slice(0, 3).map(s => (
              <span key={s} className="text-xs bg-white/5 border border-white/8 text-white/40 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {project.skills.length > 3 && (
              <span className="text-xs text-white/20">+{project.skills.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
          <div className="flex items-center gap-1 text-green-400 font-bold text-sm">
            <DollarSign className="h-3.5 w-3.5" />
            {formatCurrency(project.budget ?? project.budgetMin ?? 0)}
          </div>
          <div className="flex items-center gap-1 text-white/20 text-xs">
            <Users className="h-3.5 w-3.5" />
            {project.bidsCount || 0} bids
          </div>
        </div>
      </div>
    </Link>
  );
}