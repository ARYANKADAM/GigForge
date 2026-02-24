"use client";
import { useState, useEffect } from "react";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";

export default function Timeline({ contractId, initialEntries, canAdd = true }) {
  const [entries, setEntries] = useState(initialEntries || []);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { user } = useUser();
  const { toast } = useToast();

  useEffect(() => {
    setEntries(initialEntries || []);
  }, [initialEntries]);

  // always fetch fresh timeline on mount/change in contractId
  useEffect(() => {
    fetchTimeline();
  }, [contractId]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/timeline`);
      const data = await res.json();
      if (data.timeline) setEntries(data.timeline.sort((a,b)=> new Date(a.date) - new Date(b.date)));
    } catch (err) {}
  };

  const addEntry = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await fetch(`/api/contracts/${contractId}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add");
      // update from returned timeline if provided
      if (data.timeline) {
        setEntries(data.timeline);
      } else {
        await fetchTimeline();
      }
      setTitle("");
      setDescription("");
      setShowForm(false);
      toast({ title: "Update added" });

      // let others know
      window.dispatchEvent(new Event("notifications-updated"));
      window.dispatchEvent(new Event("timeline-updated"));
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    // refresh when notified of updates elsewhere
    const handler = () => fetchTimeline();
    window.addEventListener("timeline-updated", handler);
    return () => window.removeEventListener("timeline-updated", handler);
  }, []);

  return (
    <div className="bg-[#111111] border border-white/8 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Timeline</h2>
        {canAdd && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-white/40 hover:text-white transition"
          >
            {showForm ? "Cancel" : "Add update"}
          </button>
        )}
      </div>

      {canAdd && showForm && (
        <form onSubmit={addEntry} className="space-y-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20"
          />
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Details (optional)"
            className="w-full px-3 py-2 bg-white/5 border border-white/8 rounded-lg text-sm text-white placeholder:text-white/20"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 rounded-lg text-xs font-medium"
          >
            Save
          </button>
        </form>
      )}

      {entries.length === 0 ? (
        <p className="text-white/30 text-xs italic">
          {canAdd
            ? "No updates yet"
            : "Awaiting updates from the developer"}
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e, i) => (
            <li key={i} className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white">{e.title}</p>
                <span className="text-xs text-white/20">{formatDateTime(e.date)}</span>
              </div>
              {e.description && <p className="text-xs text-white/40">{e.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
