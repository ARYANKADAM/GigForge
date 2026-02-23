"use client";
import { useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MessageSquare, DollarSign, CheckCircle, AlertTriangle, Lock, ArrowLeft } from "lucide-react";

export default function ContractDetail({ contract, currentUserId }) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const isClient = contract.clientId === currentUserId;
  const isDeveloper = contract.developerId === currentUserId;

  const fundEscrow = async () => {
    setLoading("fund");
    try {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract._id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create payment intent");
      const fundRes = await fetch("/api/payments/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract._id, paymentIntentId: data.paymentIntentId }),
      });
      const fundData = await fundRes.json();
      if (!fundRes.ok) throw new Error(fundData.error || "Failed to fund escrow");
      toast({ title: "Escrow funded!", description: "Funds held securely. Release when work is complete." });
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const releasePayment = async () => {
    setLoading("release");
    try {
      const res = await fetch("/api/payments/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractId: contract._id }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to release");
      }
      toast({ title: "Payment released to developer!" });
      router.refresh();
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const handleAction = async (action) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/contracts/${contract._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast({ title: action === "complete" ? "Contract marked complete!" : "Dispute raised." });
      router.refresh();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setLoading("");
    }
  };

  const ESCROW_STATUS = {
    pending: { label: "Awaiting Payment", style: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    funded:  { label: "Funds in Escrow",  style: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    released:{ label: "Payment Released", style: "bg-green-500/10 text-green-400 border-green-500/20" },
    refunded:{ label: "Refunded",         style: "bg-white/5 text-white/40 border-white/10" },
  };

  const escrow = ESCROW_STATUS[contract.escrowStatus] || ESCROW_STATUS.pending;

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Back + Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/30 hover:text-white text-xs mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to contracts
        </button>
        <h1 className="text-xl font-bold text-white">Contract Details</h1>
        <p className="text-white/30 text-xs mt-0.5">Created {formatDate(contract.createdAt)}</p>
      </div>

      {/* Main info card */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-6 space-y-5">

        {/* Amount + Delivery */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/8 rounded-xl p-4">
            <p className="text-xs text-white/30 mb-1">Agreed Amount</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(contract.agreedAmount)}</p>
          </div>
          <div className="bg-white/5 border border-white/8 rounded-xl p-4">
            <p className="text-xs text-white/30 mb-1">Delivery Timeline</p>
            <p className="text-2xl font-bold text-white">{contract.deliveryDays}
              <span className="text-sm font-normal text-white/30 ml-1">days</span>
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${escrow.style}`}>
            {escrow.label}
          </span>
          <span className={`text-xs font-medium px-3 py-1 rounded-full border ${
            contract.status === "active"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : contract.status === "completed"
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : contract.status === "disputed"
              ? "bg-red-500/10 text-red-400 border-red-500/20"
              : "bg-white/5 text-white/40 border-white/10"
          }`}>
            {contract.status}
          </span>
        </div>

        {/* Escrow info box */}
        <div className="bg-white/3 border border-white/5 rounded-lg p-3 flex items-start gap-2">
          <Lock className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" />
          <p className="text-xs text-white/30 leading-relaxed">
            Funds are held securely in escrow until both parties confirm the work is complete.
            The client releases payment once satisfied with the deliverables.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-5">
        <p className="text-xs font-medium text-white/30 mb-4">Actions</p>
        <div className="flex flex-wrap gap-2">

          {/* Open Chat */}
          <Link href={`/messages/${contract.roomId}`}>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all">
              <MessageSquare className="h-4 w-4" /> Open Chat
            </button>
          </Link>

          {/* Fund Escrow */}
          {isClient && contract.status === "active" && contract.escrowStatus === "pending" && (
            <button
              onClick={fundEscrow}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <Lock className="h-4 w-4" />
              {loading === "fund" ? "Processing..." : `Fund Escrow (${formatCurrency(contract.agreedAmount)})`}
            </button>
          )}

          {/* Release Payment */}
          {isClient && contract.status === "active" && contract.escrowStatus === "funded" && (
            <button
              onClick={releasePayment}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <DollarSign className="h-4 w-4" />
              {loading === "release" ? "Processing..." : "Release Payment"}
            </button>
          )}

          {/* Mark Complete */}
          {contract.status === "active" &&
            (contract.escrowStatus === "funded" || contract.escrowStatus === "released") &&
            (isClient || isDeveloper) && (
            <button
              onClick={() => handleAction("complete")}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              {loading === "complete" ? "Processing..." : "Mark Complete"}
            </button>
          )}

          {/* Raise Dispute */}
          {contract.status === "active" && (isClient || isDeveloper) && (
            <button
              onClick={() => handleAction("dispute")}
              disabled={!!loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            >
              <AlertTriangle className="h-4 w-4" />
              {loading === "dispute" ? "Processing..." : "Raise Dispute"}
            </button>
          )}

          {/* Completed */}
          {contract.status === "completed" && (
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              Contract completed successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}