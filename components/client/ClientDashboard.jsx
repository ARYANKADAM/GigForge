"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "@/components/shared/ProjectCard";
import { FolderPlus, Briefcase, Clock, TrendingUp, FolderOpen } from "lucide-react";

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects?clientId=me")
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setProjects(list.slice(0, 6));
        setStats({
          total: list.length,
          open: list.filter(p => p.status === "open").length,
          inProgress: list.filter(p => p.status === "in_progress").length,
          completed: list.filter(p => p.status === "completed").length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Client Dashboard</h1>
          <p className="text-white/30 text-xs mt-0.5">Manage your projects and bids</p>
        </div>
        <Link href="/client/projects/new">
          <button className="flex items-center gap-2 bg-white text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-all">
            <FolderPlus className="w-4 h-4" /> Post New Project
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Projects", value: stats.total, icon: Briefcase, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Open", value: stats.open, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "In Progress", value: stats.inProgress, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { label: "Completed", value: stats.completed, icon: FolderOpen, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`${bg} border ${border} rounded-xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/30">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Recent Projects</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-7 h-7 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-[#111111] border border-white/8 rounded-xl py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-medium">No projects yet</p>
            <p className="text-white/15 text-xs mt-1">Post your first project to get started</p>
            <Link href="/client/projects/new">
              <button className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all">
                <FolderPlus className="w-3 h-3" /> Post a project
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(p => (
              <ProjectCard key={p._id} project={p} role="client" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}