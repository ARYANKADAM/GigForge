"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, Clock, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORIES = [
  "all", "Web Development", "Mobile Development", "UI/UX Design",
  "Data Science", "DevOps", "Blockchain", "AI/ML", "Cybersecurity", "Other",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "budget_high", label: "Highest Budget" },
  { value: "budget_low", label: "Lowest Budget" },
];

export default function BrowseProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "all") params.set("category", category);
      if (minBudget) params.set("minBudget", minBudget);
      if (maxBudget) params.set("maxBudget", maxBudget);
      params.set("sort", sort);
      const res = await fetch(`/api/projects/browse?${params}`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minBudget, maxBudget, sort]);

  useEffect(() => {
    const timer = setTimeout(fetchProjects, 400);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const clearFilters = () => {
    setSearch(""); setCategory("all");
    setMinBudget(""); setMaxBudget(""); setSort("newest");
  };

  const hasFilters = search || category !== "all" || minBudget || maxBudget || sort !== "newest";

  const getBudget = (project) => {
    if (project.budgetMin && project.budgetMax)
      return `${formatCurrency(project.budgetMin)} – ${formatCurrency(project.budgetMax)}`;
    if (project.budget) return formatCurrency(project.budget);
    return "Negotiable";
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Browse Projects</h1>
          <p className="text-white/30 text-xs mt-0.5">
            {loading ? "Loading..." : `${projects.length} open project${projects.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
            showFilters || hasFilters
              ? "bg-white text-black border-white"
              : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          Filters
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects by title or description..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#111111] border border-white/8 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-[#111111] border border-white/8 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/30 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c} className="bg-[#111111]">
                    {c === "all" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/30 mb-1.5">Min Budget ($)</label>
              <input
                type="number"
                value={minBudget}
                onChange={e => setMinBudget(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/30 mb-1.5">Max Budget ($)</label>
              <input
                type="number"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <label className="text-xs text-white/30">Sort by:</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#111111]">{o.label}</option>
                ))}
              </select>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-4 border-white/10 border-t-white/60 rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-[#111111] border border-white/5 rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
            <Search className="w-5 h-5 text-white/20" />
          </div>
          <p className="text-white/40 font-medium text-sm">No projects found</p>
          <p className="text-white/20 text-xs mt-1">Try adjusting your filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-xs text-white/40 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-all">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(project => (
            <div
              key={project._id}
              className="bg-[#111111] border border-white/8 rounded-xl p-5 hover:border-white/15 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-semibold text-white text-sm group-hover:text-white/90">{project.title}</h2>
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium rounded-full">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-white/30 text-xs line-clamp-2 mb-3 leading-relaxed">{project.description}</p>

                  {project.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.skillsRequired.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-white/5 text-white/40 text-xs rounded-full border border-white/8">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-white/20">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(project.createdAt)}
                    </span>
                    {project.category && (
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs">
                        {project.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-white/20 mb-0.5">Budget</p>
                    <p className="font-bold text-white text-sm">{getBudget(project)}</p>
                  </div>
                  <Link href={`/developer/projects/${project._id}`}>
                    <button className="px-4 py-2 bg-white hover:bg-white/90 text-black text-xs font-semibold rounded-lg transition-all">
                      View & Bid
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}