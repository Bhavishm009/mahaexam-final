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
} from "lucide-react";
import { getInitials } from "@/lib/avatar";
import { PasskeyManager } from "@/components/passkey-manager";
import { ChangePasswordCard } from "@/components/change-password-card";
import { MfaManager } from "@/components/mfa-manager";

export default function CoachingProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "mr",
  });

  const [profileMeta, setProfileMeta] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          const u = data.profile;
          setForm({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            preferredLanguage: u.preferredLanguage || "mr",
          });
          setProfileMeta({
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            organization: u.organization,
          });
        } else {
          setMessage({
            type: "error",
            text: data.error || "Failed to load profile details.",
          });
        }
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to connect to server." });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    setSaving(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          preferredLanguage: form.preferredLanguage,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "✅ Profile updated successfully! All changes have been saved.",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to update profile.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to submit updates.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="grid min-h-[50vh] place-items-center font-sans">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span>Loading coaching profile...</span>
        </div>
      </div>
    );
  }

  const initials = getInitials(form.name);

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-black shadow-inner backdrop-blur-md">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black sm:text-3xl">
                  {form.name || "Coaching Profile"}
                </h1>
                <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-xs font-bold backdrop-blur-sm">
                  Coaching Admin
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-amber-100">
                <Mail className="h-3.5 w-3.5" />
                <span>{form.email}</span>
                {profileMeta?.organization?.name && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 font-semibold text-white">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{profileMeta.organization.name}</span>
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {profileMeta?.createdAt && (
              <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1 text-amber-200">
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
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <div className="text-amber-200">Account Status</div>
              <div className="mt-0.5 font-bold text-emerald-300">
                {profileMeta?.status || "ACTIVE"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {message.text && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-semibold ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>वैयक्तिक माहिती (Personal Information)</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            आपले नाव, संपर्क माहिती व भाषा प्राधान्ये अपडेट करा.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                संचालकाचे नाव (Admin Name) *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="उदा. प्रथम नाव आडनाव"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                ईमेल पत्ता (Email Address)
              </label>
              <input
                type="email"
                disabled
                value={form.email}
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                मोबाईल नंबर (Phone Number)
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="१० अंकी मोबाईल नंबर"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                पसंतीची भाषा (Preferred Language)
              </label>
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              >
                <option value="mr">मराठी (Marathi)</option>
                <option value="en">English (इंग्रजी)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3 text-xs font-bold text-white shadow-glow transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>बदल सेव्ह होत आहेत...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>माहिती सेव्ह करा (Save Details)</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Two-Factor Authentication (MFA) */}
      <MfaManager />

      {/* Change Password Card */}
      <ChangePasswordCard />

      {/* Passkey & Biometrics Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <PasskeyManager />
      </div>
    </div>
  );
}
