"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Briefcase, MessageCircle, Star, DollarSign, Plus, Search, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useUser();
  const [dbUser, setDbUser] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  Promise.all([
    fetch("/api/user/profile").then(r => r.json()),
    fetch("/api/contracts").then(r => r.json()),
  ]).then(([userData, contractData]) => {
    setDbUser(userData.user);
    // ✅ handle both { contracts: [] } and plain []
    const contractList = contractData.contracts || contractData || [];
    setContracts(contractList);
  }).finally(() => setLoading(false));
}, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isClient = dbUser?.role === "client";
  const isDeveloper = dbUser?.role === "developer";
  const activeContracts = contracts.filter((c) => c.status === "active");
  const completedContracts = contracts.filter((c) => c.status === "completed");

  const stats = [
    {
      label: "Active Contracts",
      value: activeContracts.length,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Completed",
      value: completedContracts.length,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: isClient ? "Total Spent" : "Total Earned",
     value: formatCurrency(isClient ? dbUser?.totalSpent || 0 : dbUser?.totalEarned || 0),
      icon: DollarSign,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      label: "Rating",
      value: dbUser?.averageRating > 0 ? `${dbUser.averageRating}/5` : "No reviews",
      icon: Star,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8">
        {isClient && (
          <Link
            href="/client/projects/new"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Post a Project
          </Link>
        )}
        {isDeveloper && (
          <Link
            href="/developer/browse"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Search className="w-4 h-4" /> Browse Projects
          </Link>
        )}
        <Link
          href="/messages"
          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> Messages
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{value}</div>
            <div className="text-slate-500 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Recent contracts */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-lg">Recent Contracts</h2>
          <Link href={isClient ? "/client/projects" : "/developer/contracts"} className="text-blue-600 text-sm font-medium hover:underline">
            View all
          </Link>
        </div>
        {contracts.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No contracts yet</p>
            <p className="text-sm mt-1">
              {isClient ? "Post a project to get started" : "Browse projects and submit bids"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {contracts.slice(0, 5).map((contract) => (
              <Link
                key={contract._id}
                href={`/contracts/${contract._id}`}
                className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{contract.projectId?.title}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{formatDate(contract.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-blue-600 font-bold">{formatCurrency(contract.agreedAmount)}</span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      contract.status === "active"
                        ? "bg-green-100 text-green-700"
                        : contract.status === "completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {contract.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
