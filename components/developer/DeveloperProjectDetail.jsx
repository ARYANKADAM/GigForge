"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DollarSign, Calendar, Tag, Users, Loader2 } from "lucide-react";

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
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-3">
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full">
            {project.status}
          </span>
        </div>
        <p className="text-slate-600 mb-5">{project.description}</p>
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div className="flex items-center gap-2 text-slate-600"><DollarSign className="h-4 w-4 text-green-500" />{formatCurrency(project.budget ?? project.budgetMin ?? 0)}</div>
          <div className="flex items-center gap-2 text-slate-600"><Tag className="h-4 w-4 text-blue-500" />{project.category}</div>
          <div className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4" />{project.bidsCount || 0} bids</div>
          {project.deadline && <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-4 w-4" />Due {formatDate(project.deadline)}</div>}
        </div>
        {project.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.skills.map(s => <span key={s} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{s}</span>)}
          </div>
        )}
      </div>

      {project.status === "open" && (
        <div>
          {!showBidForm ? (
            <Button onClick={() => setShowBidForm(true)} className="w-full">Submit a Bid</Button>
          ) : (
            <form onSubmit={submitBid} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
              <h2 className="text-lg font-semibold">Your Proposal</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Your Bid (USD) *</Label>
                  <Input type="number" min="1" placeholder="300" required value={bid.amount} onChange={e => setBid({...bid, amount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Delivery (days) *</Label>
                  <Input type="number" min="1" placeholder="14" required value={bid.deliveryDays} onChange={e => setBid({...bid, deliveryDays: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Proposal *</Label>
                <Textarea rows={4} placeholder="Describe your approach, experience, and why you're the best fit..." required value={bid.proposal} onChange={e => setBid({...bid, proposal: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : "Submit Bid"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowBidForm(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
