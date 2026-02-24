"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FolderPlus, Sparkles, X } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "Web Development", "Mobile App", "UI/UX Design",
  "Data Science", "DevOps", "Blockchain", "AI/ML", "Cybersecurity", "Other"
];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiBox, setShowAiBox] = useState(false);
  const [idea, setIdea] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "",
    budget: "", deadline: "", skills: "",
  });

  const generateBrief = async () => {
    if (!idea.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");

      setForm({
        title: data.title || "",
        description: data.description || "",
        category: data.category || "",
        budget: data.budget?.toString() || "",
        deadline: data.deadline || "",
        skills: data.skills?.join(", ") || "",
      });
      setShowAiBox(false);
      setIdea("");
      toast({ title: "✨ Brief generated!", description: "Review and edit the details before posting." });
    } catch (err) {
      toast({ title: "AI Error", description: err.message, variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  };

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

      {/* AI Brief Generator Box */}
      {!showAiBox ? (
        <button
          onClick={() => setShowAiBox(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/15 text-purple-400 rounded-xl text-sm font-medium transition-all group"
        >
          <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
          Generate project brief with AI
        </button>
      ) : (
        <div className="bg-[#111111] border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-semibold text-white">AI Brief Generator</p>
            </div>
            <button onClick={() => setShowAiBox(false)} className="text-white/20 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-white/30 text-xs mb-3">
            Describe your idea in plain English — AI will generate a complete project brief for you.
          </p>
          <textarea
            rows={3}
            value={idea}
            onChange={e => setIdea(e.target.value)}
            placeholder='e.g. "I need an app like Uber but for home cleaning services with real-time tracking"'
            className={`${inputClass} resize-none mb-3`}
          />
          <button
            onClick={generateBrief}
            disabled={aiLoading || !idea.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 disabled:opacity-50 rounded-lg text-sm font-semibold transition-all"
          >
            {aiLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> Generate Brief</>
            }
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/8 rounded-xl p-6 space-y-5">

        {form.title && (
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <p className="text-purple-300 text-xs">AI generated — review and edit before posting</p>
          </div>
        )}

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
            placeholder="Describe your project in detail..."
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

        <div className="border-t border-white/5" />

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold py-2.5 rounded-xl transition-all text-sm"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
            : <><FolderPlus className="w-4 h-4" /> Post Project</>
          }
        </button>
      </form>
    </div>
  );
}