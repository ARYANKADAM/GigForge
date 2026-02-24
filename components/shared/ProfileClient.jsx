"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Globe, DollarSign, Briefcase, Plus, X, Edit2, Check } from "lucide-react";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export default function ProfileClient({ initialUser }) {
  const { user: clerkUser } = useUser();
  const { toast } = useToast();
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [form, setForm] = useState({
    bio: initialUser?.bio || "",
    skills: initialUser?.skills || [],
    hourlyRate: initialUser?.hourlyRate || "",
    location: initialUser?.location || "",
    portfolio: initialUser?.portfolio || "",
  });

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      const updatedUser = {
        ...user, ...form,
        hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      };
      setUser(updatedUser);
      setForm({
        bio: updatedUser.bio || "",
        skills: updatedUser.skills || [],
        hourlyRate: updatedUser.hourlyRate || "",
        location: updatedUser.location || "",
        portfolio: updatedUser.portfolio || "",
      });
      setEditing(false);
      toast({ title: "Profile updated!" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      bio: user?.bio || "",
      skills: user?.skills || [],
      hourlyRate: user?.hourlyRate || "",
      location: user?.location || "",
      portfolio: user?.portfolio || "",
    });
    setEditing(false);
  };

  const inputClass = "w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all";
  const labelClass = "block text-xs font-medium text-white/40 mb-2 uppercase tracking-wide";

  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Header with ripple */}
      <div className="relative rounded-xl overflow-hidden border border-white/5 mb-2">
        <BackgroundRippleEffect rows={5} cols={20} cellSize={48} />
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse 100% 100% at 50% 0%, transparent 20%, #0a0a0a 100%)",
          }}
        />
        <div className="relative z-20 flex items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-white">My Profile</h1>
            <p className="text-white/30 text-xs mt-0.5">Manage your public profile</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-sm font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-white/90 disabled:opacity-50 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-6">

        {/* Avatar + Info */}
        <div className="flex items-center gap-4 mb-6">
          {clerkUser?.imageUrl ? (
            <img src={clerkUser.imageUrl} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-2xl">
              {(user?.name || clerkUser?.firstName)?.[0] || "?"}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">
              {user?.name || `${clerkUser?.firstName || ""} ${clerkUser?.lastName || ""}`.trim() || "Your Name"}
            </h2>
            <p className="text-white/30 text-xs flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" />
              {user?.email || clerkUser?.emailAddresses?.[0]?.emailAddress || "No email"}
            </p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              user?.role === "client"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : user?.role === "admin"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                : "bg-green-500/10 text-green-400 border-green-500/20"
            }`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/5">
          {[
            { label: "Reviews", value: user?.totalReviews || 0 },
            { label: "Rating", value: user?.averageRating > 0 ? `${user.averageRating}★` : "—" },
            {
              label: user?.role === "developer" ? "Earned" : "Spent",
              value: `$${user?.totalEarned || user?.totalSpent || 0}`
            },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-white/30 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

      </div>{/* end profile card */}

      {/* Editable Fields */}
      <div className="bg-[#111111] border border-white/8 rounded-xl p-6 space-y-5">

        {/* Bio */}
        <div>
          <label className={labelClass}>Bio</label>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Tell others about yourself..."
              className={`${inputClass} resize-none`}
            />
          ) : (
            <p className="text-white/60 text-sm leading-relaxed">
              {user?.bio || <span className="text-white/20 italic">No bio yet</span>}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className={`${labelClass} flex items-center gap-1`}>
            <MapPin className="w-3 h-3" /> Location
          </label>
          {editing ? (
            <select
              value={form.location}
              onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              className={`${inputClass} bg-[#111111]`}
            >
              <option value="" className="bg-[#111111]">Select your city...</option>
              <optgroup label="Maharashtra">
                <option className="bg-[#111111]">Mumbai, Maharashtra</option>
                <option className="bg-[#111111]">Pune, Maharashtra</option>
                <option className="bg-[#111111]">Nagpur, Maharashtra</option>
                <option className="bg-[#111111]">Nashik, Maharashtra</option>
                <option className="bg-[#111111]">Thane, Maharashtra</option>
              </optgroup>
              <optgroup label="Karnataka">
                <option className="bg-[#111111]">Bangalore, Karnataka</option>
                <option className="bg-[#111111]">Mysore, Karnataka</option>
                <option className="bg-[#111111]">Mangalore, Karnataka</option>
              </optgroup>
              <optgroup label="Tamil Nadu">
                <option className="bg-[#111111]">Chennai, Tamil Nadu</option>
                <option className="bg-[#111111]">Coimbatore, Tamil Nadu</option>
                <option className="bg-[#111111]">Madurai, Tamil Nadu</option>
              </optgroup>
              <optgroup label="Delhi">
                <option className="bg-[#111111]">New Delhi, Delhi</option>
                <option className="bg-[#111111]">Noida, Delhi NCR</option>
                <option className="bg-[#111111]">Gurgaon, Delhi NCR</option>
              </optgroup>
              <optgroup label="Gujarat">
                <option className="bg-[#111111]">Ahmedabad, Gujarat</option>
                <option className="bg-[#111111]">Surat, Gujarat</option>
                <option className="bg-[#111111]">Vadodara, Gujarat</option>
              </optgroup>
              <optgroup label="Telangana">
                <option className="bg-[#111111]">Hyderabad, Telangana</option>
                <option className="bg-[#111111]">Warangal, Telangana</option>
              </optgroup>
              <optgroup label="West Bengal">
                <option className="bg-[#111111]">Kolkata, West Bengal</option>
                <option className="bg-[#111111]">Howrah, West Bengal</option>
              </optgroup>
              <optgroup label="Rajasthan">
                <option className="bg-[#111111]">Jaipur, Rajasthan</option>
                <option className="bg-[#111111]">Jodhpur, Rajasthan</option>
                <option className="bg-[#111111]">Udaipur, Rajasthan</option>
              </optgroup>
              <optgroup label="Kerala">
                <option className="bg-[#111111]">Kochi, Kerala</option>
                <option className="bg-[#111111]">Thiruvananthapuram, Kerala</option>
              </optgroup>
              <optgroup label="Other">
                <option className="bg-[#111111]">Remote / Work from Home</option>
                <option className="bg-[#111111]">Other</option>
              </optgroup>
            </select>
          ) : (
            <p className="text-white/60 text-sm">
              {user?.location || <span className="text-white/20 italic">Not specified</span>}
            </p>
          )}
        </div>

        {/* Hourly Rate — developer only */}
        {user?.role === "developer" && (
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <DollarSign className="w-3 h-3" /> Hourly Rate
            </label>
            {editing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                  placeholder="0"
                  className={`${inputClass} pl-7`}
                />
              </div>
            ) : (
              <p className="text-white/60 text-sm">
                {user?.hourlyRate
                  ? `$${user.hourlyRate}/hr`
                  : <span className="text-white/20 italic">Not set</span>
                }
              </p>
            )}
          </div>
        )}

        {/* Portfolio */}
        <div>
          <label className={`${labelClass} flex items-center gap-1`}>
            <Globe className="w-3 h-3" /> Portfolio / Website
          </label>
          {editing ? (
            <input
              type="url"
              value={form.portfolio}
              onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))}
              placeholder="https://yourportfolio.com"
              className={inputClass}
            />
          ) : (
            user?.portfolio
              ? <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:text-blue-300 transition-colors">{user.portfolio}</a>
              : <span className="text-white/20 italic text-sm">Not set</span>
          )}
        </div>

        {/* Skills — developer only */}
        {user?.role === "developer" && (
          <div>
            <label className={`${labelClass} flex items-center gap-1`}>
              <Briefcase className="w-3 h-3" /> Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {form.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1 px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 rounded-full text-xs font-medium">
                  {skill}
                  {editing && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition ml-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {form.skills.length === 0 && !editing && (
                <span className="text-white/20 italic text-sm">No skills added yet</span>
              )}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill and press Enter..."
                  className={inputClass}
                />
                <button
                  onClick={addSkill}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>{/* end editable fields */}

    </div>
  );
}