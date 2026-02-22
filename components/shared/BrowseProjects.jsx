"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, Filter, DollarSign, Clock, ChevronDown } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

const CATEGORIES = [
  "all",
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Data Science",
  "DevOps",
  "Blockchain",
  "AI/ML",
  "Cybersecurity",
  "Other",
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(fetchProjects, 400);
    return () => clearTimeout(timer);
  }, [fetchProjects]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setMinBudget("");
    setMaxBudget("");
    setSort("newest");
  };

  const hasFilters = search || category !== "all" || minBudget || maxBudget || sort !== "newest";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Projects</h1>
          <p className="text-slate-500 text-sm mt-1">
            {loading ? "Loading..." : `${projects.length} open project${projects.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
            showFilters || hasFilters
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-bold">!</span>}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search projects by title or description..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Category */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Min Budget ($)</label>
              <input
                type="number"
                value={minBudget}
                onChange={e => setMinBudget(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Max Budget ($)</label>
              <input
                type="number"
                value={maxBudget}
                onChange={e => setMaxBudget(e.target.value)}
                placeholder="10000"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Sort + Clear */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Sort by:</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Projects List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Search className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">No projects found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(project => (
            <div key={project._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="font-semibold text-slate-900">{project.title}</h2>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                      {project.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-2 mb-3">{project.description}</p>

                  {/* Skills Required */}
                  {project.skillsRequired?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {project.skillsRequired.map(skill => (
                        <span key={skill} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDate(project.createdAt)}
                    </span>
                    {project.category && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                        {project.category}
                      </span>
                    )}
                    {project.deliveryDays && (
                      <span>{project.deliveryDays} days delivery</span>
                    )}
                  </div>
                </div>

                {/* Budget + Bid Button */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 mb-0.5">Budget</p>
                    <p className="font-bold text-slate-900">
                      {project.budgetMin && project.budgetMax
                        ? `${formatCurrency(project.budgetMin)} - ${formatCurrency(project.budgetMax)}`
                        : project.budget
                        ? formatCurrency(project.budget)
                        : "Negotiable"}
                    </p>
                  </div>
                  <Link href={`/developer/projects/${project._id}`}>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition">
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