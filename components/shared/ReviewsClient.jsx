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
          <Star className={`w-5 h-5 ${star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
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
      // Only completed contracts eligible for review
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
      // Refresh received reviews
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
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {["received", "give"].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition ${
              tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "give" ? "Give a Review" : "Reviews Received"}
          </button>
        ))}
      </div>

      {/* Reviews Received */}
      {tab === "received" && (
        <div className="space-y-4">
          {received.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm mt-1">Complete contracts to receive reviews</p>
            </div>
          ) : (
            received.map(review => (
              <div key={review._id} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-3">
                  <StarRating value={review.rating} readonly />
                  <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-slate-700">{review.comment}</p>
                <p className="text-xs text-slate-400 mt-2 capitalize">{review.type?.replace(/_/g, " ")}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Give a Review */}
      {tab === "give" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {contracts.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-medium">No completed contracts to review</p>
              <p className="text-sm mt-1">Complete a contract first</p>
            </div>
          ) : (
            <form onSubmit={submitReview} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Contract</label>
                <select
                  value={form.contractId}
                  onChange={e => setForm(f => ({ ...f, contractId: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a contract...</option>
                  {contracts.map(c => (
                    <option key={c._id} value={c._id}>
                      Contract #{c._id.slice(-6)} — ${c.agreedAmount}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rating</label>
                <StarRating
                  value={form.rating}
                  onChange={r => setForm(f => ({ ...f, rating: r }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  placeholder="Share your experience working with this person..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm font-medium">{success}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl transition"
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