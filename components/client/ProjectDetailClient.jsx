"use client";
import { useState } from "react";
import BidCard from "@/components/shared/BidCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Calendar, DollarSign, Tag, Users } from "lucide-react";

export default function ProjectDetailClient({ project, bids, currentUserId, isOwner }) {
  // `isOwner` is calculated on the server so the client can rely on it.
  // the legacy check based on currentUserId is no longer needed here.

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
          <span className="bg-green-100 text-green-700 text-sm font-medium px-3 py-1 rounded-full capitalize">
            {project.status.replace("_", " ")}
          </span>
        </div>
        <p className="text-slate-600 mb-5">{project.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600"><DollarSign className="h-4 w-4 text-green-500" />{formatCurrency(project.budget ?? project.budgetMin ?? 0)}</div>
          <div className="flex items-center gap-2 text-slate-600"><Tag className="h-4 w-4 text-blue-500" />{project.category}</div>
          <div className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4" />{project.bidsCount || 0} bids</div>
          {project.deadline && <div className="flex items-center gap-2 text-slate-600"><Calendar className="h-4 w-4" />{formatDate(project.deadline)}</div>}
        </div>
        {project.skills?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {project.skills.map(s => <span key={s} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">{s}</span>)}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Bids ({bids.length})</h2>
        {bids.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No bids yet.</div>
        ) : (
          <div className="space-y-4">
            {bids.map(bid => (
              <BidCard
                key={bid._id}
                bid={bid}
                projectId={project._id}
                isClient={isOwner}
                projectStatus={project.status}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
