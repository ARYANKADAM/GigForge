"use client";
import { useState, useEffect } from "react";
import { Users, FolderOpen, FileText, Star, DollarSign, Ban, Trash2, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminClient() {
  const [tab, setTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        fetch("/api/admin/stats").then(r => r.json()),
        fetch("/api/admin/users").then(r => r.json()),
        fetch("/api/admin/projects").then(r => r.json()),
      ]);
      if (statsRes.error) throw new Error(statsRes.error);
      setStats(statsRes);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setProjects(Array.isArray(projectsRes) ? projectsRes : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const banUser = async (id, action) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isBanned: action === "ban" } : u));
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project permanently?")) return;
    await fetch("/api/admin/projects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: id }),
    });
    setProjects(prev => prev.filter(p => p._id !== id));
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="text-center py-16 text-red-500">
      <p className="font-medium">Error: {error}</p>
      <button onClick={fetchAll} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {["stats", "users", "projects"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats */}
      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Total Projects", value: stats.totalProjects, icon: FolderOpen, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "Total Contracts", value: stats.totalContracts, icon: FileText, color: "text-purple-600", bg: "bg-purple-50" },
            { label: "Total Reviews", value: stats.totalReviews, icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Active Contracts", value: stats.activeContracts, icon: FileText, color: "text-green-600", bg: "bg-green-50" },
            { label: "Completed", value: stats.completedContracts, icon: CheckCircle, color: "text-teal-600", bg: "bg-teal-50" },
            { label: "Banned Users", value: stats.bannedUsers, icon: Ban, color: "text-red-600", bg: "bg-red-50" },
            { label: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "text-green-700", bg: "bg-green-50" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className="text-2xl font-extrabold text-slate-900">{value}</div>
              <div className="text-slate-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Earned</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user._id} className={user.isBanned ? "bg-red-50" : ""}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {user.name?.[0] || "?"}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin" ? "bg-purple-100 text-purple-700" :
                      user.role === "client" ? "bg-blue-100 text-blue-700" :
                      "bg-green-100 text-green-700"
                    }`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 font-medium">{formatCurrency(user.totalEarned || 0)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>{user.isBanned ? "Banned" : "Active"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => banUser(user._id, user.isBanned ? "unban" : "ban")}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        user.isBanned
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-red-100 text-red-700 hover:bg-red-200"
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Projects */}
      {tab === "projects" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Project</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Budget</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Posted</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projects.map(project => (
                <tr key={project._id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{project.title}</p>
                    <p className="text-xs text-slate-400 truncate max-w-xs">{project.description}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-500 capitalize">{project.category}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "open" ? "bg-green-100 text-green-700" :
                      project.status === "in_progress" ? "bg-blue-100 text-blue-700" :
                      "bg-slate-100 text-slate-600"
                    }`}>{project.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(project.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => deleteProject(project._id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}