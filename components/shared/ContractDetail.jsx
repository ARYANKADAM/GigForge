"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { MessageSquare, DollarSign, CheckCircle, AlertTriangle, Lock } from "lucide-react";

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
        body: JSON.stringify({
          contractId: contract._id,
          paymentIntentId: data.paymentIntentId,
        }),
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
    pending: { label: "Awaiting Payment", color: "text-yellow-600 bg-yellow-50" },
    funded: { label: "Funds in Escrow", color: "text-blue-600 bg-blue-50" },
    released: { label: "Payment Released", color: "text-green-600 bg-green-50" },
    refunded: { label: "Refunded", color: "text-slate-600 bg-slate-50" },
  };

  const escrow = ESCROW_STATUS[contract.escrowStatus] || ESCROW_STATUS.pending;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contract Details</h1>
        <p className="text-slate-500 mt-1">Contract created {formatDate(contract.createdAt)}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-500 mb-1">Agreed Amount</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(contract.agreedAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Delivery</p>
            <p className="text-lg font-semibold text-slate-900">{contract.deliveryDays} days</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${escrow.color}`}>
            {escrow.label}
          </span>
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${
            contract.status === "active" ? "bg-blue-50 text-blue-600" :
            contract.status === "completed" ? "bg-green-50 text-green-600" :
            contract.status === "disputed" ? "bg-red-50 text-red-600" :
            "bg-slate-100 text-slate-600"
          }`}>
            {contract.status}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Open Chat — always visible */}
        <Link href={`/messages/${contract.roomId}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Open Chat
          </Button>
        </Link>

        {/* Step 1: Fund escrow — client only, when pending */}
        {isClient && contract.status === "active" && contract.escrowStatus === "pending" && (
          <Button
            onClick={fundEscrow}
            disabled={!!loading}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            {loading === "fund" ? "Processing..." : `Fund Escrow (${formatCurrency(contract.agreedAmount)})`}
          </Button>
        )}

        {/* Step 2: Release payment — client only, when funded */}
        {isClient && contract.status === "active" && contract.escrowStatus === "funded" && (
          <Button
            onClick={releasePayment}
            disabled={!!loading}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <DollarSign className="h-4 w-4" />
            {loading === "release" ? "Processing..." : "Release Payment"}
          </Button>
        )}

        {/* Mark Complete — both client and developer, when funded OR released */}
        {contract.status === "active" &&
          (contract.escrowStatus === "funded" || contract.escrowStatus === "released") &&
          (isClient || isDeveloper) && (
          <Button
            onClick={() => handleAction("complete")}
            disabled={!!loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {loading === "complete" ? "Processing..." : "Mark Complete"}
          </Button>
        )}

        {/* Raise Dispute — both, only when active */}
        {contract.status === "active" && (isClient || isDeveloper) && (
          <Button
            onClick={() => handleAction("dispute")}
            disabled={!!loading}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            {loading === "dispute" ? "Processing..." : "Raise Dispute"}
          </Button>
        )}

        {/* Completed state message */}
        {contract.status === "completed" && (
          <div className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="h-5 w-5" />
            Contract completed successfully!
          </div>
        )}
      </div>
    </div>
  );
}