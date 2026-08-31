"use client";

import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  BookOpen,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

const maharashtraDistricts = [
  "Pune",
  "Mumbai City",
  "Mumbai Suburban",
  "Thane",
  "Nagpur",
  "Nashik",
  "Chhatrapati Sambhajinagar (Aurangabad)",
  "Kolhapur",
  "Solapur",
  "Amravati",
  "Nanded",
  "Satara",
  "Sangli",
  "Ahmednagar",
  "Jalgaon",
  "Latur",
  "Dhule",
  "Parbhani",
  "Jalna",
  "Raigad",
  "Ratnagiri",
  "Sindhudurg",
  "Beed",
  "Buldhana",
  "Yavatmal",
  "Washim",
  "Akola",
  "Bhandara",
  "Gondia",
  "Chandrapur",
  "Gadchiroli",
  "Wardha",
  "Hingoli",
  "Osmanabad (Dharashiv)",
  "Nandurbar",
  "Palghar",
];

const targetExams = [
  "Maharashtra Police Bharti",
  "MPSC Rajyaseva (State Services)",
  "MPSC Group B & C (Combine)",
  "Talathi Bharti",
  "Zilla Parishad (ZP) Bharti",
  "Vanrakshak (Forest Guard)",
  "Arogya Vibhag Bharti",
  "Gramsevak Bharti",
  "Saralseva Pariksha",
  "Other Competitive Exam",
];

const educationList = [
  "10th (SSC) Pass",
  "12th (HSC) Pass",
  "Diploma",
  "Graduate (BA / BCom / BSc / BE)",
  "Post Graduate (MA / MCom / MSc / ME)",
  "Other Qualification",
];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "en",
    targetExam: "",
    education: "",
    district: "",
    taluka: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profileMeta, setProfileMeta] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          const u = data.profile;
          const sp = u.studentProfile || {};
          setForm({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            preferredLanguage: u.preferredLanguage || "en",
            targetExam: sp.targetExam || "",
            education: sp.education || "",
            district: sp.district || "",
            taluka: sp.taluka || "",
            newPassword: "",
            confirmPassword: "",
          });
          setProfileMeta({
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            coachingStatus: sp.coachingStatus || "INDIVIDUAL",
          });
        } else {
          setMessage({
            type: "error",
            text: data.error || "Failed to load profile.",
          });
        }
      } catch (err) {
        setMessage({ type: "error", text: err.message || "Failed to connect." });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (form.newPassword && form.newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({
        type: "error",
        text: "New password and Confirm password do not match.",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/student/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          preferredLanguage: form.preferredLanguage,
          targetExam: form.targetExam,
          education: form.education,
          district: form.district,
          taluka: form.taluka,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Profile updated successfully! All changes have been saved.",
        });
        setForm((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
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
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Loading student profile...</span>
        </div>
      </div>
    );
  }

  const initials = (form.name || "Student")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-black backdrop-blur-md">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-black sm:text-3xl">{form.name || "My Profile"}</h1>
              <p className="mt-1 flex items-center gap-2 text-sm text-blue-100">
                <Mail className="h-3.5 w-3.5" />
                <span>{form.email}</span>
                <span>·</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                  Student
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <div className="text-blue-200">Target Exam</div>
              <div className="mt-0.5 font-bold text-white">{form.targetExam || "Not Selected"}</div>
            </div>
            <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
              <div className="text-blue-200">District</div>
              <div className="mt-0.5 font-bold text-white">{form.district || "Maharashtra"}</div>
            </div>
            {profileMeta?.createdAt && (
              <div className="rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-sm">
                <div className="text-blue-200">Joined</div>
                <div className="mt-0.5 font-bold text-white">
                  {new Date(profileMeta.createdAt).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {message.text && (
        <div
          className={`animate-in fade-in flex items-start gap-3 rounded-2xl p-4 text-sm font-semibold duration-200 ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <div className="flex-1">{message.text}</div>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal & Contact Information Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Personal & Contact Information</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Update your basic details for rank reports and certificates.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Full Name */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Rahul Shinde"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Email Address <span className="font-normal text-slate-400">(Registered)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={form.email}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400"
                />
              </div>
            </div>

            {/* Mobile Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                />
              </div>
            </div>

            {/* Preferred Language */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Preferred Interface Language
              </label>
              <select
                value={form.preferredLanguage}
                onChange={(e) => setForm({ ...form, preferredLanguage: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              >
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Academic & Target Exam Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Target Exam & Location</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Personalizes your mock test recommendations and district rankings.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {/* Target Exam */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Primary Target Exam
              </label>
              <select
                value={form.targetExam}
                onChange={(e) => setForm({ ...form, targetExam: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              >
                <option value="">-- Select Target Exam --</option>
                {targetExams.map((exam) => (
                  <option key={exam} value={exam}>
                    {exam}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Qualification */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Highest Education Qualification
              </label>
              <select
                value={form.education}
                onChange={(e) => setForm({ ...form, education: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              >
                <option value="">-- Select Qualification --</option>
                {educationList.map((edu) => (
                  <option key={edu} value={edu}>
                    {edu}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Home District (Maharashtra)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <select
                  value={form.district}
                  onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                >
                  <option value="">-- Select District --</option>
                  {maharashtraDistricts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Taluka */}
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Taluka (Optional)
              </label>
              <input
                type="text"
                value={form.taluka}
                onChange={(e) => setForm({ ...form, taluka: e.target.value })}
                placeholder="e.g. Haveli, Baramati"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              />
            </div>
          </div>
        </div>

        {/* Biometric & Push Notification Settings Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                <KeyRound className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span>फिंगरप्रिंट व बायोमेट्रिक लॉगिन (Passkey / WebAuthn)</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                पासवर्ड न टाकता थेट फिंगरप्रिंट / Face ID द्वारे १-क्लिक मध्ये सुरक्षित लॉगिन करा.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  if (typeof window === "undefined" || !window.PublicKeyCredential) {
                    alert("This browser / device does not support WebAuthn Passkeys.");
                    return;
                  }
                  const optRes = await fetch("/api/auth/webauthn/register/options", {
                    method: "POST",
                  });
                  const options = await optRes.json();
                  if (!optRes.ok) {
                    throw new Error(options.error || "Failed to start registration");
                  }

                  options.challenge = Uint8Array.from(
                    atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")),
                    (c) => c.charCodeAt(0),
                  );
                  options.user.id = Uint8Array.from(
                    atob(options.user.id.replace(/-/g, "+").replace(/_/g, "/")),
                    (c) => c.charCodeAt(0),
                  );

                  const credential = await navigator.credentials.create({
                    publicKey: options,
                  });

                  if (!credential) {
                    throw new Error("Registration was cancelled");
                  }

                  const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
                  const clientDataJSON = btoa(
                    String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON)),
                  );
                  const attestationObject = btoa(
                    String.fromCharCode(...new Uint8Array(credential.response.attestationObject)),
                  );

                  const verifyRes = await fetch("/api/auth/webauthn/register/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      id: credential.id,
                      rawId,
                      type: credential.type,
                      response: { clientDataJSON, attestationObject },
                    }),
                  });
                  const d = await verifyRes.json();
                  if (d.success) {
                    alert("✅ " + d.message);
                  } else {
                    alert("❌ " + (d.error || "Registration failed"));
                  }
                } catch (e) {
                  if (e.name !== "NotAllowedError") {
                    alert("❌ " + e.message);
                  }
                }
              }}
              className="inline-flex items-center gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-50 px-5 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 active:scale-95 dark:border-indigo-500/30 dark:bg-indigo-950/40 dark:text-indigo-300"
            >
              <KeyRound className="h-4 w-4" />
              <span>Register Biometric / Fingerprint</span>
            </button>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Security & Password (Optional)</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Leave blank if you do not want to change your password.
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-glow transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving Changes..." : "Update Profile"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
