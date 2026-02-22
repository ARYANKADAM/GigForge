"use client";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Shield, Users, Briefcase, Ban } from "lucide-react";

export default function AdminDashboard({ users, projects }) {
  const { toast } = useToast();
  const [tab, setTab] = useState("users");

  const banUser = async (userId) => {
    try {
      await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isBanned: true }) });
      toast({ title: "User banned" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  const removeProject = async (projectId) => {
    try {
      await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      toast({ title: "Project removed" });
    } catch { toast({ title: "Error", variant: "destructive" }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5"><p className="text-sm text-slate-500">Total Users</p><p className="text-3xl font-bold">{users.length}</p></div>
        <div className="bg-white rounded-xl border p-5"><p className="text-sm text-slate-500">Total Projects</p><p className="text-3xl font-bold">{projects.length}</p></div>
      </div>

      <div className="flex gap-2">
        <Button variant={tab === "users" ? "default" : "outline"} onClick={() => setTab("users")}><Users className="h-4 w-4 mr-2" />Users</Button>
        <Button variant={tab === "projects" ? "default" : "outline"} onClick={() => setTab("projects")}><Briefcase className="h-4 w-4 mr-2" />Projects</Button>
      </div>

      {tab === "users" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Name</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3"><span className="capitalize bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{u.role}</span></td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {!u.isBanned && u.role !== "admin" && (
                      <Button size="sm" variant="destructive" onClick={() => banUser(u.clerkId)}>
                        <Ban className="h-3 w-3 mr-1" />Ban
                      </Button>
                    )}
                    {u.isBanned && <span className="text-red-500 text-xs font-medium">Banned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "projects" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Title</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Posted</th>
              <th className="text-left px-4 py-3 font-medium text-slate-600">Actions</th>
            </tr></thead>
            <tbody className="divide-y">
              {projects.map(p => (
                <tr key={p._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-slate-500">{p.category}</td>
                  <td className="px-4 py-3 capitalize">{p.status.replace("_", " ")}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="destructive" onClick={() => removeProject(p._id)}>Remove</Button>
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
