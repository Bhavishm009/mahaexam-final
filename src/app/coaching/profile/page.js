"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Loader2,
  Edit3,
  X,
  Globe,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { UserAvatar } from "@/components/user-avatar";
import { PasskeyManager } from "@/components/passkey-manager";
import { ChangePasswordCard } from "@/components/change-password-card";
import { MfaManager } from "@/components/mfa-manager";

export default function CoachingProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security"
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "mr",
    profilePhoto: "",
  });

  const [originalForm, setOriginalForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "mr",
    profilePhoto: "",
  });

  const [profileMeta, setProfileMeta] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          const u = data.profile;
          const initialData = {
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            preferredLanguage: u.preferredLanguage || "mr",
            profilePhoto: u.profilePhoto || "",
          };
          setForm(initialData);
          setOriginalForm(initialData);
          setProfileMeta({
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            organization: u.organization,
            mfaEnabled: u.mfaEnabled,
          });
        } else {
          toast.error(data.error || "Failed to load coaching profile.");
        }
      } catch (err) {
        toast.error(err.message || "Failed to connect to server.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (res.ok && result.url) {
        setForm((prev) => ({ ...prev, profilePhoto: result.url }));
        setOriginalForm((prev) => ({ ...prev, profilePhoto: result.url }));

        const saveRes = await fetch("/api/auth/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhoto: result.url }),
        });

        if (saveRes.ok) {
          toast.success("Profile photo updated successfully!");
        } else {
          toast.error("Failed to save photo to profile.");
        }
      } else {
        toast.error(result.error || "Failed to upload avatar image.");
      }
    } catch (err) {
      toast.error("Avatar upload error: " + err.message);
    } finally {
      setUploadingPhoto(false);
    }
  }

  function handleCancelEdit() {
    setForm(originalForm);
    setIsEditing(false);
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!form.name?.trim()) {
      toast.error("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          preferredLanguage: form.preferredLanguage,
          profilePhoto: form.profilePhoto,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setOriginalForm(form);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit updates.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl space-y-6 font-sans">
        <div className="h-44 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-orange-600 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            <UserAvatar
              src={form.profilePhoto}
              name={form.name}
              size="xl"
              editable={true}
              uploading={uploadingPhoto}
              onUpload={handlePhotoUpload}
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                  {form.name || "Coaching Profile"}
                </h1>
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
                  Coaching Admin
                </span>
                {profileMeta?.mfaEnabled && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                    <ShieldCheck className="h-3 w-3" />
                    <span>2FA Protected</span>
                  </span>
                )}
              </div>

              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-amber-100">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 opacity-80" />
                  <span>{form.email}</span>
                </span>
                {profileMeta?.organization?.name && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{profileMeta.organization.name}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 text-xs">
            {profileMeta?.createdAt && (
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-amber-200 font-medium">
                  <Calendar className="h-3 w-3" />
                  <span>Member Since</span>
                </div>
                <div className="mt-0.5 font-bold text-white">
                  {new Date(profileMeta.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-md">
              <div className="text-amber-200 font-medium">Account Status</div>
              <div className="mt-0.5 flex items-center gap-1 font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{profileMeta?.status || "ACTIVE"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "profile"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "security"
                ? "bg-amber-600 text-white shadow-md shadow-amber-600/20 dark:bg-amber-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Security & 2FA</span>
            {profileMeta?.mfaEnabled && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {activeTab === "profile" && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* TAB 1: Profile Details */}
      {activeTab === "profile" && (
        <>
          {!isEditing ? (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">
                      Coaching Administrator Information
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Primary administrative contact for your academy.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-500 active:scale-95"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Admin Name
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.name || "Not specified"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Email Address
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.email}
                      </div>
                      <div className="text-[10px] text-slate-400">Primary login credential</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Mobile Number
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.phone || <span className="italic text-slate-400">Not linked yet</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Language
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.preferredLanguage === "en" ? "English" : "मराठी (Marathi)"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-xs dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900 dark:text-amber-200">
                        Profile Photo & Branding
                      </span>
                      <p className="text-amber-700/80 dark:text-amber-300/80">
                        Click the camera icon on the avatar above to set your personal coaching photo.
                      </p>
                    </div>
                  </div>
                  <label
                    htmlFor="profile-avatar-input"
                    className="cursor-pointer rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-amber-500"
                  >
                    Change Photo
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in-50 duration-200">
              <div className="rounded-3xl border border-amber-200 bg-white p-6 shadow-md dark:border-amber-900/50 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                      <Edit3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <span>Edit Coaching Profile</span>
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update your administrator name, contact, and language preference.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>Cancel</span>
                  </button>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Admin Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Director / Teacher Name"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      disabled
                      value={form.email}
                      className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Phone className="h-3.5 w-3.5 text-slate-500" />
                      <span>Mobile Number</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Preferred Language
                    </label>
                    <select
                      value={form.preferredLanguage}
                      onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-600 focus:ring-2 focus:ring-amber-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-amber-500 dark:focus:ring-amber-900/50"
                    >
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="en">English (इंग्रजी)</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-2xl border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-7 py-2.5 text-xs font-bold text-white shadow-glow transition-all hover:bg-amber-500 active:scale-95 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: Security & 2FA */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          <MfaManager />
          <ChangePasswordCard />
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <PasskeyManager />
          </div>
        </div>
      )}
    </div>
  );
}
