"use client";
import { useState } from "react";
import BidCard from "@/components/shared/BidCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, Tag, Users, ArrowLeft, Edit2, Trash2, X, Save, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = [
  "Web Development", "Mobile App", "UI/UX Design",
  "Data Science", "DevOps", "Blockchain", "AI/ML", "Cybersecurity", "Other"
];

const STATUS_STYLES = {
  open: "bg-green-500/10 text-green-400 border-green-500/20",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed: "bg-white/5 text-white/40 border-white/10",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function ProjectDetailClient({ project, bids, currentUserId, isOwner }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: project.title || "",
    description: project.description || "",
    category: project.category || "",
    budget: project.budget || project.budgetMin || "",
    deadline: project.deadline ? new Date(project.deadline).toISOString().split("T")[0] : "",
    skills: project.skills?.join(", ") || "",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update");
      }
      toast({ title: "Project updated!" });
      setShowEdit(false);
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast({ title: "Project deleted" });
      router.push("/client/projects");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all";
  const labelClass = "block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wide";

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
      </button>

      {/* Project Info */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4 gap-4">
          <h1 className="text-xl font-bold text-white">{project.title}</h1>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[project.status] || STATUS_STYLES.open}`}>
              {project.status?.replace("_", " ")}
            </span>
            {/* Edit + Delete — owner only */}
            {isOwner && project.status === "open" && (
              <>
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 rounded-lg text-xs font-medium transition-all"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-white/40 text-sm leading-relaxed mb-5">{project.description}</p>

        {/* Meta */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            { icon: DollarSign, value: formatCurrency(project.budget ?? project.budgetMin ?? 0), color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
            { icon: Tag, value: project.category || "—", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
            { icon: Users, value: `${bids.length || 0} bids`, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
            ...(project.deadline ? [{ icon: Calendar, value: formatDate(project.deadline), color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }] : []),
          ].map(({ icon: Icon, value, color, bg, border }) => (
            <div key={value} className={`${bg} border ${border} rounded-lg p-3 flex items-center gap-2`}>
              <Icon className={`w-4 h-4 ${color} shrink-0`} />
              <span className="text-white/60 text-xs font-medium">{value}</span>
            </div>
          ))}
        </div>

        {/* Skills */}
        {project.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
            {project.skills.map(s => (
              <span key={s} className="bg-white/5 border border-white/8 text-white/40 text-xs px-2.5 py-1 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Bids */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">
          Bids <span className="text-white/30 font-normal text-sm">({bids.length})</span>
        </h2>
        {bids.length === 0 ? (
          <div className="bg-[#111111] border border-white/8 rounded-xl py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Users className="w-5 h-5 text-white/20" />
            </div>
            <p className="text-white/30 text-sm">No bids yet</p>
            <p className="text-white/15 text-xs mt-1">Developers will start bidding soon</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.map(bid => (
              <BidCard key={bid._id} bid={bid} projectId={project._id} isClient={isOwner} projectStatus={project.status} />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowEdit(false)} />

          {/* Modal */}
          <div className="relative bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-white">Edit Project</h2>
              <button onClick={() => setShowEdit(false)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                <X className="w-4 h-4 text-white/40" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Category + Budget */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className={`${inputClass} bg-[#111111]`}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} className="bg-[#111111]">{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Budget (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                      className={`${inputClass} pl-7`}
                    />
                  </div>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label className={labelClass}>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                  className={`${inputClass} [color-scheme:dark]`}
                />
              </div>

              {/* Skills */}
              <div>
                <label className={labelClass}>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={form.skills}
                  onChange={e => setForm(f => ({ ...f, skills: e.target.value }))}
                  placeholder="React, Node.js, MongoDB"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pt-4 border-t border-white/5">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/50 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold rounded-lg text-sm transition-all"
              >
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[#111111] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">Delete Project?</h2>
              <p className="text-white/30 text-xs">This will permanently delete <span className="text-white/60 font-medium">"{project.title}"</span> and all its bids. This cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/50 hover:text-white rounded-lg text-sm font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 disabled:opacity-50 rounded-lg text-sm font-semibold transition-all"
              >
                {deleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : <><Trash2 className="w-4 h-4" /> Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}