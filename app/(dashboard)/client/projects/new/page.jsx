"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FolderPlus } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Web Development", "Mobile App", "UI/UX Design",
  "Data Science", "DevOps", "Blockchain", "AI/ML", "Cybersecurity", "Other"
];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "",
    budget: "", deadline: "", skills: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      toast({ title: "Project posted!", description: "Developers can now bid on your project." });
      router.push("/client/projects");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all";
  const labelClass = "block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wide";

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link href="/client/projects" className="text-white/20 hover:text-white/50 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-white">Post a New Project</h1>
        </div>
        <p className="text-white/30 text-xs ml-6">Fill in the details and developers will start bidding.</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/8 rounded-xl p-6 space-y-5">

        {/* Title */}
        <div>
          <label className={labelClass}>Project Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Build a SaaS dashboard with Next.js"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className={inputClass}
          />
        </div>

        {/* Description */}
        <div>
          <label className={labelClass}>Description *</label>
          <textarea
            rows={5}
            required
            placeholder="Describe your project in detail — what you need, expected deliverables, and any specific requirements..."
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Category + Budget */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Category *</label>
            <select
              required
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value })}
              className={`${inputClass} bg-[#111111]`}
            >
              <option value="" className="bg-[#111111]">Select category...</option>
              {CATEGORIES.map(c => (
                <option key={c} value={c} className="bg-[#111111]">{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Budget (USD) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
              <input
                type="number"
                min="10"
                required
                placeholder="500"
                value={form.budget}
                onChange={e => setForm({ ...form, budget: e.target.value })}
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
            onChange={e => setForm({ ...form, deadline: e.target.value })}
            className={`${inputClass} [color-scheme:dark]`}
          />
        </div>

        {/* Skills */}
        <div>
          <label className={labelClass}>Required Skills</label>
          <input
            type="text"
            placeholder="React, Node.js, MongoDB (comma-separated)"
            value={form.skills}
            onChange={e => setForm({ ...form, skills: e.target.value })}
            className={inputClass}
          />
          <p className="text-white/15 text-xs mt-1.5">Separate skills with commas</p>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5" />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold py-2.5 rounded-xl transition-all text-sm"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
          ) : (
            <><FolderPlus className="w-4 h-4" /> Post Project</>
          )}
        </button>
      </form>
    </div>
  );
}