"use client";
import { MapPin, Globe, Star, DollarSign, Briefcase, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`w-4 h-4 ${star <= value ? "fill-amber-400 text-amber-400" : "text-white/10"}`} />
      ))}
    </div>
  );
}

export default function PublicProfile({ user, reviews }) {
  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Hero Card */}
      <div className="bg-[#111111] border border-white/8 rounded-xl overflow-hidden">

        {/* Banner with Ripple — no fade, just the grid */}
        <div className="relative h-24 overflow-hidden">
          <BackgroundRippleEffect rows={2} cols={24} cellSize={48} />
          {/* Subtle purple glow */}
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)",
            }}
          />
        </div>

        {/* Avatar row — sits outside the banner, clearly visible */}
        <div className="px-6">
          <div className="flex items-end justify-between -mt-10">
            <div className="relative z-20">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-[#111111] shadow-xl"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/10 ring-4 ring-[#111111] flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                  {user.name?.[0] || "?"}
                </div>
              )}
              <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#111111]" />
            </div>
          </div>
        </div>

        {/* Name + Meta + Stats */}
        <div className="px-6 pt-3 pb-6">
          <h1 className="text-xl font-bold text-white mb-1.5">{user.name}</h1>
          <div className="flex items-center gap-2 flex-wrap mb-5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              user.role === "client"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-green-500/10 text-green-400 border-green-500/20"
            }`}>
              {user.role}
            </span>
            {user.location && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <MapPin className="w-3 h-3" /> {user.location}
              </span>
            )}
            {user.hourlyRate && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <DollarSign className="w-3 h-3" /> ${user.hourlyRate}/hr
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
            {[
              { label: "Reviews", value: user.totalReviews || 0 },
              { label: "Rating", value: user.averageRating > 0 ? `${user.averageRating}★` : "—" },
              { label: user.role === "developer" ? "Earned" : "Spent", value: `$${user.totalEarned || user.totalSpent || 0}` },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-white/30 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About + Skills + Portfolio */}
      {(user.bio || user.skills?.length > 0 || user.portfolio) && (
        <div className="bg-[#111111] border border-white/8 rounded-xl p-6 space-y-5">
          {user.bio && (
            <div>
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2">About</h3>
              <p className="text-white/60 text-sm leading-relaxed">{user.bio}</p>
            </div>
          )}
          {user.skills?.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-white/5 border border-white/8 text-white/50 rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {user.portfolio && (
            <div>
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2 flex items-center gap-1">
                <Globe className="w-3 h-3" /> Portfolio
              </h3>
              <a
                href={user.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm transition-colors group"
              >
                {user.portfolio.replace(/^https?:\/\//, "")}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">
          Reviews
          <span className="text-white/30 font-normal ml-1.5">({reviews.length})</span>
        </h3>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-2">
              <Star className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-white/20 text-sm italic">No reviews yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <StarRating value={review.rating} />
                  <span className="text-xs text-white/20">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}