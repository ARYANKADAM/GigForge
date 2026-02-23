"use client";
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition`}
        >
          <Star className={`w-5 h-5 ${star <= value ? "fill-amber-400 text-amber-400" : "text-white/15"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsClient({ currentUserId }) {
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ contractId: "", rating: 5, comment: "" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/reviews?userId=${currentUserId}`).then(r => r.json()),
      fetch("/api/contracts").then(r => r.json()),
    ]).then(([reviewData, contractData]) => {
      setReceived(Array.isArray(reviewData) ? reviewData : []);
      const contractList = contractData.contracts || contractData || [];
      setContracts(contractList.filter(c => c.status === "completed"));
    }).finally(() => setLoading(false));
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.contractId) return setError("Please select a contract");
    if (!form.comment.trim()) return setError("Please write a comment");
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSuccess("Review submitted successfully!");
      setForm({ contractId: "", rating: 5, comment: "" });
      const updated = await fetch(`/api/reviews?userId=${currentUserId}`).then(r => r.json());
      setReceived(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
    </div>
  );

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all";

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">Reviews</h1>
        <p className="text-white/30 text-xs mt-0.5">Your reputation on FreelanceHub</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/8 rounded-xl p-1">
        {[
          { key: "received", label: "Reviews Received" },
          { key: "give", label: "Give a Review" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              tab === key
                ? "bg-white text-black"
                : "text-white/40 hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reviews Received */}
      {tab === "received" && (
        <div className="space-y-3">
          {received.length === 0 ? (
            <div className="bg-[#111111] border border-white/8 rounded-xl py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/30 text-sm font-medium">No reviews yet</p>
              <p className="text-white/15 text-xs mt-1">Complete contracts to receive reviews</p>
            </div>
          ) : (
            received.map(review => (
              <div key={review._id} className="bg-[#111111] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <StarRating value={review.rating} readonly />
                  <span className="text-xs text-white/20">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{review.comment}</p>
                {review.type && (
                  <p className="text-xs text-white/20 mt-2 capitalize">{review.type.replace(/_/g, " ")}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Give a Review */}
      {tab === "give" && (
        <div className="bg-[#111111] border border-white/8 rounded-xl p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Star className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-white/30 text-sm font-medium">No completed contracts to review</p>
              <p className="text-white/15 text-xs mt-1">Complete a contract first</p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-5">

              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wide">Select Contract</label>
                <select
                  value={form.contractId}
                  onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))}
                  className={`${inputClass} bg-[#111111]`}
                >
                  <option value="" className="bg-[#111111]">Choose a contract...</option>
                  {contracts.map(c => (
                    <option key={c._id} value={c._id} className="bg-[#111111]">
                      Contract #{c._id.slice(-6)} — ${c.agreedAmount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wide">Rating</label>
                <StarRating
                  value={form.rating}
                  onChange={r => setForm(f => ({ ...f, rating: r }))}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wide">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  placeholder="Share your experience working with this person..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">{error}</p>
              )}
              {success && (
                <p className="text-green-400 text-xs bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-lg">{success}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/20 text-black font-semibold py-2.5 rounded-xl transition-all text-sm"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}