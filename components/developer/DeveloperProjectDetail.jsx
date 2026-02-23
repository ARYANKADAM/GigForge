"use client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Calendar, Tag, Users, Loader2, ArrowLeft, Send, X } from "lucide-react";

export default function DeveloperProjectDetail({ project, currentUserId }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bid, setBid] = useState({ amount: "", deliveryDays: "", proposal: "" });

  const submitBid = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${project._id}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bid),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to submit bid");
      }
      toast({ title: "Bid submitted!", description: "The client will be notified." });
      setShowBidForm(false);
      setBid({ amount: "", deliveryDays: "", proposal: "" });
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all";
  const labelClass = "block text-xs font-medium text-white/40 mb-1.5 uppercase tracking-wide";

  const STATUS_STYLES = {
    open: "bg-green-500/10 text-green-400 border-green-500/20",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-white/5 text-white/40 border-white/10",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
      </button>

      {/* Project Card */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-6">

        {/* Title + Status */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <h1 className="text-xl font-bold text-white leading-snug">{project.title}</h1>
          <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${STATUS_STYLES[project.status] || STATUS_STYLES.open}`}>
            {project.status}
          </span>
        </div>

        {/* Description */}
        <p className="text-white/40 text-sm leading-relaxed mb-6">{project.description}</p>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400 shrink-0" />
            <span className="text-white/60 text-xs font-medium">
              {formatCurrency(project.budget ?? project.budgetMin ?? 0)}
            </span>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-white/60 text-xs font-medium">{project.category || "—"}</span>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-white/60 text-xs font-medium">{project.bidsCount || 0} bids so far</span>
          </div>
          {project.deadline && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-white/60 text-xs font-medium">Due {formatDate(project.deadline)}</span>
            </div>
          )}
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

      {/* Bid Section */}
      {project.status === "open" && (
        <>
          {!showBidForm ? (
            /* Submit CTA */
            <button
              onClick={() => setShowBidForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-white hover:bg-white/90 text-black font-semibold py-3 rounded-xl text-sm transition-all"
            >
              <Send className="w-4 h-4" /> Submit a Bid
            </button>
          ) : (
            /* Bid Form */
            <div className="bg-[#111111] border border-white/8 rounded-xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-white">Your Proposal</h2>
                  <p className="text-white/30 text-xs mt-0.5">Make a compelling case to win this project</p>
                </div>
                <button
                  onClick={() => setShowBidForm(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/8 flex items-center justify-center transition-all"
                >
                  <X className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>

              <form onSubmit={submitBid} className="space-y-4">

                {/* Amount + Days */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Your Bid (USD) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="300"
                        value={bid.amount}
                        onChange={e => setBid({ ...bid, amount: e.target.value })}
                        className={`${inputClass} pl-7`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Delivery (days) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      placeholder="14"
                      value={bid.deliveryDays}
                      onChange={e => setBid({ ...bid, deliveryDays: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Proposal */}
                <div>
                  <label className={labelClass}>Proposal *</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Describe your approach, relevant experience, and why you're the best fit for this project..."
                    value={bid.proposal}
                    onChange={e => setBid({ ...bid, proposal: e.target.value })}
                    className={`${inputClass} resize-none`}
                  />
                  <p className="text-white/15 text-xs mt-1.5">
                    Tip: Mention specific technologies and past similar projects
                  </p>
                </div>

                {/* Hint box */}
                <div className="bg-white/3 border border-white/5 rounded-lg p-3 flex gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-white/20 shrink-0 mt-0.5" />
                  <p className="text-white/25 text-xs leading-relaxed">
                    Client's budget is <span className="text-white/50 font-medium">{formatCurrency(project.budget ?? project.budgetMin ?? 0)}</span>.
                    Competitive bids with strong proposals get accepted faster.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowBidForm(false)}
                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 text-white/40 hover:text-white rounded-lg text-sm font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold rounded-lg text-sm transition-all"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                      : <><Send className="w-4 h-4" /> Submit Bid</>
                    }
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Project closed state */}
      {project.status !== "open" && (
        <div className="bg-[#111111] border border-white/8 rounded-xl p-5 text-center">
          <p className="text-white/30 text-sm">This project is no longer accepting bids</p>
          <p className="text-white/15 text-xs mt-1 capitalize">Status: {project.status?.replace("_", " ")}</p>
        </div>
      )}
    </div>
  );
}