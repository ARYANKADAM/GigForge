"use client";
import Image from "next/image";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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

  const statusColor = bid.status === "accepted" ? "text-green-600" : bid.status === "rejected" ? "text-red-500" : "text-yellow-600";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start gap-4">
        {bid.developerImage && (
          <Image src={bid.developerImage} alt={bid.developerName} width={44} height={44} className="rounded-full flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-semibold text-slate-900">{bid.developerName}</p>
            <span className={`text-xs font-medium capitalize ${statusColor}`}>{bid.status}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
            <span className="flex items-center gap-1"><DollarSign className="h-4 w-4 text-green-500" />{formatCurrency(bid.amount)}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{bid.deliveryDays} days</span>
          </div>
          <p className="text-sm text-slate-600">{bid.proposal}</p>
        </div>
      </div>
      {isClient && projectStatus === "open" && bid.status === "pending" && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
          <Button size="sm" onClick={() => handleAction("accept")} disabled={loading} className="bg-green-600 hover:bg-green-700">
            Accept Bid
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleAction("reject")} disabled={loading}>
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
