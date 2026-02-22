"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, MapPin, Globe, Star, DollarSign, Briefcase, Plus, X } from "lucide-react";

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

    console.log("Saved user:", data.user); // check browser console

    // ✅ Update state with fresh data
    const updatedUser = {
      ...user,
      ...form,
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Avatar + Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          {clerkUser?.imageUrl ? (
            <img src={clerkUser.imageUrl} alt="" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
              {user?.name?.[0] || "?"}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
              <Mail className="w-3 h-3" /> {user?.email}
            </p>
            <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.role === "client" ? "bg-blue-100 text-blue-700" :
              user?.role === "admin" ? "bg-purple-100 text-purple-700" :
              "bg-green-100 text-green-700"
            }`}>{user?.role}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{user?.totalReviews || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Reviews</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              {user?.averageRating > 0 ? `${user.averageRating}★` : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">Rating</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              ${user?.totalEarned || user?.totalSpent || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {user?.role === "developer" ? "Earned" : "Spent"}
            </p>
          </div>
        </div>
      </div>

      {/* Editable Fields */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              rows={3}
              placeholder="Tell others about yourself..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <p className="text-slate-600 text-sm">{user?.bio || <span className="text-slate-400 italic">No bio yet</span>}</p>
          )}
        </div>

      {/* Location */}
<div>
  <label className="block text-sm font-medium text-slate-700 mb-1.5">
    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
  </label>
  {editing ? (
    <select
      value={form.location}
      onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      <option value="">Select your city...</option>
      <optgroup label="Maharashtra">
        <option>Mumbai, Maharashtra</option>
        <option>Pune, Maharashtra</option>
        <option>Nagpur, Maharashtra</option>
        <option>Nashik, Maharashtra</option>
        <option>Aurangabad, Maharashtra</option>
        <option>Thane, Maharashtra</option>
      </optgroup>
      <optgroup label="Karnataka">
        <option>Bangalore, Karnataka</option>
        <option>Mysore, Karnataka</option>
        <option>Hubli, Karnataka</option>
        <option>Mangalore, Karnataka</option>
      </optgroup>
      <optgroup label="Tamil Nadu">
        <option>Chennai, Tamil Nadu</option>
        <option>Coimbatore, Tamil Nadu</option>
        <option>Madurai, Tamil Nadu</option>
        <option>Salem, Tamil Nadu</option>
      </optgroup>
      <optgroup label="Delhi">
        <option>New Delhi, Delhi</option>
        <option>Noida, Delhi NCR</option>
        <option>Gurgaon, Delhi NCR</option>
        <option>Faridabad, Delhi NCR</option>
      </optgroup>
      <optgroup label="Uttar Pradesh">
        <option>Lucknow, Uttar Pradesh</option>
        <option>Kanpur, Uttar Pradesh</option>
        <option>Agra, Uttar Pradesh</option>
        <option>Varanasi, Uttar Pradesh</option>
      </optgroup>
      <optgroup label="Gujarat">
        <option>Ahmedabad, Gujarat</option>
        <option>Surat, Gujarat</option>
        <option>Vadodara, Gujarat</option>
        <option>Rajkot, Gujarat</option>
      </optgroup>
      <optgroup label="Rajasthan">
        <option>Jaipur, Rajasthan</option>
        <option>Jodhpur, Rajasthan</option>
        <option>Udaipur, Rajasthan</option>
        <option>Kota, Rajasthan</option>
      </optgroup>
      <optgroup label="West Bengal">
        <option>Kolkata, West Bengal</option>
        <option>Howrah, West Bengal</option>
        <option>Durgapur, West Bengal</option>
      </optgroup>
      <optgroup label="Telangana">
        <option>Hyderabad, Telangana</option>
        <option>Warangal, Telangana</option>
        <option>Nizamabad, Telangana</option>
      </optgroup>
      <optgroup label="Andhra Pradesh">
        <option>Visakhapatnam, Andhra Pradesh</option>
        <option>Vijayawada, Andhra Pradesh</option>
        <option>Tirupati, Andhra Pradesh</option>
      </optgroup>
      <optgroup label="Madhya Pradesh">
        <option>Bhopal, Madhya Pradesh</option>
        <option>Indore, Madhya Pradesh</option>
        <option>Jabalpur, Madhya Pradesh</option>
      </optgroup>
      <optgroup label="Punjab">
        <option>Chandigarh, Punjab</option>
        <option>Ludhiana, Punjab</option>
        <option>Amritsar, Punjab</option>
      </optgroup>
      <optgroup label="Bihar">
        <option>Patna, Bihar</option>
        <option>Gaya, Bihar</option>
        <option>Muzaffarpur, Bihar</option>
      </optgroup>
      <optgroup label="Kerala">
        <option>Thiruvananthapuram, Kerala</option>
        <option>Kochi, Kerala</option>
        <option>Kozhikode, Kerala</option>
      </optgroup>
      <optgroup label="Other">
        <option>Remote / Work from Home</option>
        <option>Other</option>
      </optgroup>
    </select>
  ) : (
    <p className="text-slate-600 text-sm">
      {user?.location || <span className="text-slate-400 italic">Not specified</span>}
    </p>
  )}
</div>

        {/* Hourly Rate — developer only */}
        {user?.role === "developer" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" /> Hourly Rate
            </label>
            {editing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input
                  type="number"
                  value={form.hourlyRate}
                  onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : (
              <p className="text-slate-600 text-sm">
                {user?.hourlyRate ? `$${user.hourlyRate}/hr` : <span className="text-slate-400 italic">Not set</span>}
              </p>
            )}
          </div>
        )}

        {/* Portfolio */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Portfolio / Website
          </label>
          {editing ? (
            <input
              type="url"
              value={form.portfolio}
              onChange={e => setForm(f => ({ ...f, portfolio: e.target.value }))}
              placeholder="https://yourportfolio.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            user?.portfolio
              ? <a href={user.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm hover:underline">{user.portfolio}</a>
              : <span className="text-slate-400 italic text-sm">Not set</span>
          )}
        </div>

        {/* Skills — developer only */}
        {user?.role === "developer" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {form.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                  {skill}
                  {editing && (
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {form.skills.length === 0 && !editing && (
                <span className="text-slate-400 italic text-sm">No skills added yet</span>
              )}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill (press Enter)"
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addSkill}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}