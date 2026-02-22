"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Web Development", "Mobile App", "UI/UX Design", "Data Science", "DevOps", "Blockchain", "Other"];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", budget: "", deadline: "", skills: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, skills: form.skills.split(",").map(s => s.trim()) }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      toast({ title: "Project posted!", description: "Developers can now bid on your project." });
      router.push("/dashboard");
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Post a New Project</h1>
        <p className="text-slate-500 mt-1">Fill in the details and developers will start bidding.</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-8 space-y-5">
        <div className="space-y-2">
          <Label>Project Title *</Label>
          <Input placeholder="e.g. Build a SaaS dashboard with Next.js" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Description *</Label>
          <Textarea rows={5} placeholder="Describe your project in detail..." required value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category *</Label>
            <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Budget (USD) *</Label>
            <Input type="number" min="10" placeholder="500" required value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Deadline</Label>
          <Input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Required Skills (comma-separated)</Label>
          <Input placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...</> : "Post Project"}
        </Button>
      </form>
    </div>
  );
}
