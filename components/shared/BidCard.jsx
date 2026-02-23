"use client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Clock, DollarSign, Check, X } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const STATUS_STYLES = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  accepted: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function BidCard({ bid, projectId, isClient, projectStatus }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bids/${bid._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: action === "accept" ? "Bid accepted! Contract created." : "Bid rejected." });
      router.refresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111111] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all">
      <div className="flex items-start gap-4">

        {/* Avatar */}
        {bid.developerImage ? (
          <img
            src={bid.developerImage}
            alt={bid.developerName}
            className="w-10 h-10 rounded-full object-cover shrink-0 ring-2 ring-white/10"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-white/50 font-bold text-sm">
            {bid.developerName?.[0] || "?"}
          </div>
        )}

        <div className="flex-1 min-w-0">

          {/* Name + Status */}
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-white/80 text-sm">{bid.developerName || "Developer"}</p>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize ${STATUS_STYLES[bid.status] || STATUS_STYLES.pending}`}>
              {bid.status}
            </span>
          </div>

          {/* Amount + Days */}
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1 text-green-400 font-bold text-sm">
              <DollarSign className="w-3.5 h-3.5" />
              {formatCurrency(bid.amount)}
            </span>
            <span className="flex items-center gap-1 text-white/30 text-xs">
              <Clock className="w-3.5 h-3.5" />
              {bid.deliveryDays} days delivery
            </span>
          </div>

          {/* Proposal */}
          <p className="text-white/40 text-xs leading-relaxed">{bid.proposal}</p>
        </div>
      </div>

      {/* Actions */}
      {isClient && projectStatus === "open" && bid.status === "pending" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
          <button
            onClick={() => handleAction("accept")}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            Accept Bid
          </button>
          <button
            onClick={() => handleAction("reject")}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
}