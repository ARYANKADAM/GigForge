"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProjectCard from "@/components/shared/ProjectCard";
import { Button } from "@/components/ui/button";
import { Search, FileText, DollarSign, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function DeveloperDashboard() {
  const [recentProjects, setRecentProjects] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/projects?status=open").then(r => r.json()).then(data => setRecentProjects(data.slice(0, 3)));
    fetch("/api/users").then(r => r.json()).then(setUser);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Developer Dashboard</h1>
        <Link href="/developer/projects">
          <Button className="flex items-center gap-2">
            <Search className="h-4 w-4" /> Browse Projects
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Total Earned", value: formatCurrency(user?.totalEarned || 0), icon: DollarSign, color: "text-green-600" },
          { label: "Avg Rating", value: user?.averageRating ? `${user.averageRating} ★` : "No reviews", icon: Star, color: "text-yellow-500" },
          { label: "Total Reviews", value: user?.totalReviews || 0, icon: FileText, color: "text-blue-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Latest Open Projects</h2>
        {recentProjects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400">No open projects found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentProjects.map(p => <ProjectCard key={p._id} project={p} role="developer" />)}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link href="/developer/projects">
            <Button variant="outline">View All Projects →</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
