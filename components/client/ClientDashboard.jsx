"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "@/components/shared/ProjectCard";
import { Button } from "@/components/ui/button";
import { FolderPlus, Briefcase, DollarSign, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ClientDashboard() {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, completed: 0 });

  useEffect(() => {
    fetch("/api/projects?clientId=me")
      .then(r => r.json())
      .then(data => {
        setProjects(data.slice(0, 6));
        setStats({
          total: data.length,
          open: data.filter(p => p.status === "open").length,
          inProgress: data.filter(p => p.status === "in_progress").length,
          completed: data.filter(p => p.status === "completed").length,
        });
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Client Dashboard</h1>
        <Link href="/client/projects/new">
          <Button className="flex items-center gap-2">
            <FolderPlus className="h-4 w-4" /> Post New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Projects", value: stats.total, icon: Briefcase, color: "text-blue-600" },
          { label: "Open", value: stats.open, icon: Clock, color: "text-yellow-600" },
          { label: "In Progress", value: stats.inProgress, icon: Briefcase, color: "text-blue-500" },
          { label: "Completed", value: stats.completed, icon: DollarSign, color: "text-green-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Projects</h2>
        {projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No projects yet.</p>
            <Link href="/client/projects/new">
              <Button className="mt-4">Post Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {projects.map(p => <ProjectCard key={p._id} project={p} role="client" />)}
          </div>
        )}
      </div>
    </div>
  );
}
