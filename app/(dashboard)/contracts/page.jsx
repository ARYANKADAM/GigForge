import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FileText, ArrowRight } from "lucide-react";

export default async function ContractsPage() {
  const { userId } = await auth();
  await connectDB();
  const contracts = await Contract.find({
    $or: [{ clientId: userId }, { developerId: userId }]
  }).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-5">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">My Contracts</h1>
        <p className="text-white/30 text-xs mt-0.5">
          {contracts.length} contract{contracts.length !== 1 ? "s" : ""}
        </p>
      </div>

      {contracts.length === 0 ? (
        <div className="bg-[#111111] border border-white/8 rounded-xl py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <FileText className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-white/40 text-sm font-medium">No contracts yet</p>
          <p className="text-white/20 text-xs mt-1">Contracts will appear here once a bid is accepted</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <Link href={`/contracts/${c._id}`} key={c._id.toString()}>
              <div className="bg-[#111111] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all group flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4 text-white/30" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">
                      {formatCurrency(c.agreedAmount)}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {c.deliveryDays} day delivery
                      <span className="mx-1.5 text-white/15">·</span>
                      Started {formatDate(c.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    c.status === "active"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                      : c.status === "completed"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/5 text-white/40 border-white/10"
                  }`}>
                    {c.status}
                  </span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    c.escrowStatus === "funded"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : c.escrowStatus === "released"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/5 text-white/40 border-white/10"
                  }`}>
                    {c.escrowStatus}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/0 group-hover:text-white/30 transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}