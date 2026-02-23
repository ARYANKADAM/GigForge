"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Briefcase, MessageCircle, Star, DollarSign, Plus, Search, TrendingUp, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

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
      const contractList = contractData.contracts || contractData || [];
      setContracts(contractList);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  const isClient = dbUser?.role === "client";
  const isDeveloper = dbUser?.role === "developer";
  const activeContracts = contracts.filter(c => c.status === "active");
  const completedContracts = contracts.filter(c => c.status === "completed");

  const stats = [
    {
      label: "Active Contracts",
      value: activeContracts.length,
      icon: Briefcase,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      label: "Completed",
      value: completedContracts.length,
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
      border: "border-green-500/20",
    },
    {
      label: isClient ? "Total Spent" : "Total Earned",
      value: formatCurrency(isClient ? dbUser?.totalSpent || 0 : dbUser?.totalEarned || 0),
      icon: DollarSign,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      label: "Rating",
      value: dbUser?.averageRating > 0 ? `${dbUser.averageRating}/5` : "No reviews",
      icon: Star,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* ✅ Hero section with ripple background */}
      <div className="relative rounded-2xl overflow-hidden border border-white/5">
      
        {/* Ripple grid — only covers this section */}
        
    
        {/* Fade overlay so bottom blends into dark */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 20%, #0a0a0a 100%)",
          }}
        />

        {/* Content on top of ripple */}
        <div className="relative z-20 p-6">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-white/30 text-sm mt-1">
                Here's what's happening with your account.
              </p>
            </div>

            {/* Quick actions */}
            <div className="flex gap-2">
              {isClient && (
                <Link
                  href="/client/projects/new"
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all"
                >
                  <Plus className="w-4 h-4" /> Post Project
                </Link>
              )}
              {isDeveloper && (
                <Link
                  href="/developer/projects"
                  className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all"
                >
                  <Search className="w-4 h-4" /> Browse Projects
                </Link>
              )}
              <Link
                href="/messages"
                className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-all"
              >
                <MessageCircle className="w-4 h-4" /> Messages
              </Link>
            </div>
          </div>

          {/* Stats inside ripple section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.map(({ label, value, icon: Icon, color, bg, border }) => (
              <div
                key={label}
                className={`bg-black/40 backdrop-blur-sm border ${border} rounded-xl p-5 transition-all`}
              >
                <div className={`w-9 h-9 rounded-lg ${bg} border ${border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-white/30 text-xs mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Contracts — outside ripple section */}
      <div className="bg-[#111111] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm">Recent Contracts</h2>
          <Link
            href="/contracts"
            className="text-white/30 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {contracts.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-medium">No contracts yet</p>
            <p className="text-white/20 text-xs mt-1">
              {isClient ? "Post a project to get started" : "Browse projects and submit bids"}
            </p>
            {isClient ? (
              <Link
                href="/client/projects/new"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" /> Post your first project
              </Link>
            ) : (
              <Link
                href="/developer/projects"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
              >
                <Search className="w-3 h-3" /> Browse projects
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {contracts.slice(0, 5).map(contract => (
              <Link
                key={contract._id}
                href={`/contracts/${contract._id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-white/3 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5 text-white/30" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {contract.projectId?.title || contract.title || "Untitled Project"}
                    </p>
                    <p className="text-white/30 text-xs mt-0.5">{formatDate(contract.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 font-semibold text-sm">
                    {formatCurrency(contract.agreedAmount)}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    contract.status === "active"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : contract.status === "completed"
                      ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}>
                    {contract.status}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-white/0 group-hover:text-white/30 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}