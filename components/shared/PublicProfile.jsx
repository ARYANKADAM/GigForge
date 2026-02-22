"use client";
import Link from "next/link";
import { MapPin, Globe, Star, DollarSign, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";

function StarRating({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={`w-4 h-4 ${star <= value ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
      ))}
    </div>
  );
}

export default function PublicProfile({ user, reviews }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
              {user.name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user.role === "client" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
              }`}>{user.role}</span>
              {user.location && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="w-3.5 h-3.5" /> {user.location}
                </span>
              )}
              {user.hourlyRate && (
                <span className="flex items-center gap-1 text-sm text-slate-500">
                  <DollarSign className="w-3.5 h-3.5" /> ${user.hourlyRate}/hr
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{user.totalReviews || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {user.averageRating > 0 ? `${user.averageRating}★` : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">${user.totalEarned || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Earned</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {user.bio && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1.5">About</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{user.bio}</p>
          </div>
        )}
        {user.skills?.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {user.portfolio && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Portfolio
            </h3>
            <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">
              {user.portfolio}
            </a>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-slate-400 text-sm italic">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <div key={review._id} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <StarRating value={review.rating} />
                  <span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-slate-600 text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}