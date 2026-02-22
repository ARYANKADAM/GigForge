import { auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/db";
import Contract from "@/models/Contract";
import Project from "@/models/Project";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ContractsPage() {
  const { userId } = await auth();
  await connectDB();
  const contracts = await Contract.find({ $or: [{ clientId: userId }, { developerId: userId }] }).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Contracts</h1>
      {contracts.length === 0 ? (
        <div className="text-center py-16 text-slate-400 bg-white rounded-xl border">No contracts yet.</div>
      ) : (
        <div className="space-y-4">
          {contracts.map(c => (
            <Link href={`/contracts/${c._id}`} key={c._id.toString()}>
              <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{formatCurrency(c.agreedAmount)}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{c.deliveryDays} day delivery · Started {formatDate(c.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${c.status === "active" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                    {c.status}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${c.escrowStatus === "funded" ? "bg-yellow-100 text-yellow-700" : c.escrowStatus === "released" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                    {c.escrowStatus}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
