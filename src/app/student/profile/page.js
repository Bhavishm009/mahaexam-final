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
  Loader2,
  Edit3,
  X,
  Globe,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { PasskeyManager } from "@/components/passkey-manager";
import { ChangePasswordCard } from "@/components/change-password-card";
import { MfaManager } from "@/components/mfa-manager";
import { fetchJson } from "@/lib/api-client";
import { toast } from "sonner";

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
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security"
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "mr",
    targetExam: "",
    education: "",
    district: "",
    taluka: "",
    profilePhoto: "",
  });

  const [originalForm, setOriginalForm] = useState({
    name: "",
    email: "",
    phone: "",
    preferredLanguage: "mr",
    targetExam: "",
    education: "",
    district: "",
    taluka: "",
    profilePhoto: "",
  });

  const [profileMeta, setProfileMeta] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { ok, data } = await fetchJson("/api/student/profile");
        if (ok && data.profile) {
          const u = data.profile;
          const sp = u.studentProfile || {};
          const initialData = {
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            preferredLanguage: u.preferredLanguage || "mr",
            targetExam: sp.targetExam || "",
            education: sp.education || "",
            district: sp.district || "",
            taluka: sp.taluka || "",
            profilePhoto: sp.profilePhoto || "",
          };
          setForm(initialData);
          setOriginalForm(initialData);
          setProfileMeta({
            role: u.role,
            status: u.status,
            createdAt: u.createdAt,
            coachingStatus: sp.coachingStatus || "INDIVIDUAL",
            mfaEnabled: u.mfaEnabled,
          });
        } else {
          toast.error(data.error || "विद्यार्थी माहिती लोड करता आली नाही.");
        }
      } catch (err) {
        toast.error(err.message || "सर्व्हरशी संपर्क होऊ शकला नाही.");
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
      toast.error("फोटो ५MB पेक्षा लहान असावा.");
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

        // Automatically save to student profile backend
        const saveRes = await fetch("/api/student/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhoto: result.url }),
        });

        if (saveRes.ok) {
          toast.success("प्रोफाइल फोटो यशस्वीरित्या अपडेट झाला!");
        } else {
          toast.error("फोटो सेव्ह करताना त्रुटी आली.");
        }
      } else {
        toast.error(result.error || "फोटो अपलोड अयशस्वी झाला.");
      }
    } catch (err) {
      toast.error("फोटो अपलोड त्रुटी: " + err.message);
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
      toast.error("कृपया पूर्ण नाव प्रविष्ट करा.");
      return;
    }

    setSaving(true);
    try {
      const { ok, data } = await fetchJson("/api/student/profile", {
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
          profilePhoto: form.profilePhoto,
        }),
      });

      if (ok && data.success) {
        setOriginalForm(form);
        setIsEditing(false);
        toast.success("✅ प्रोफाइल माहिती यशस्वीरित्या सेव्ह झाली!");
      } else {
        toast.error(data.error || "प्रोफाइल अपडेट करताना त्रुटी आली.");
      }
    } catch (err) {
      toast.error(err.message || "माहिती सबमिट करता आली नाही.");
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-800 p-6 text-white shadow-xl sm:p-8">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-5">
            {/* Attractive Avatar with custom 3D dummy avatar & camera upload */}
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
                  {form.name || "माझी प्रोफाइल (My Profile)"}
                </h1>
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-0.5 text-xs font-bold backdrop-blur-md">
                  विद्यार्थी (Student)
                </span>
                {profileMeta?.mfaEnabled && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 backdrop-blur-md">
                    <ShieldCheck className="h-3 w-3" />
                    <span>2FA Protected</span>
                  </span>
                )}
              </div>

              <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-blue-100">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 opacity-80" />
                  <span>{form.email}</span>
                </span>
                {form.targetExam && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-blue-200">🎯 {form.targetExam}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Highlights */}
          <div className="flex flex-wrap gap-2.5 text-xs">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <div className="text-blue-200 font-medium">टार्गेट परीक्षा</div>
              <div className="mt-0.5 font-bold text-white max-w-[150px] truncate">
                {form.targetExam || "निवडलेली नाही"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
              <div className="text-blue-200 font-medium">जिल्हा</div>
              <div className="mt-0.5 font-bold text-white">{form.district || "महाराष्ट्र"}</div>
            </div>
            {profileMeta?.createdAt && (
              <div className="rounded-2xl border border-white/15 bg-white/10 px-3.5 py-2 backdrop-blur-md">
                <div className="text-blue-200 font-medium">सदस्य नोंदणी</div>
                <div className="mt-0.5 font-bold text-white">
                  {new Date(profileMeta.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "profile"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
            }`}
          >
            <User className="h-4 w-4" />
            <span>प्रोफाइल तपशील (Profile Details)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all ${
              activeTab === "security"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 dark:bg-blue-500"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>सुरक्षा व २FA (Security & 2FA)</span>
            {profileMeta?.mfaEnabled && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {activeTab === "profile" && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/40"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>बदल करा (Edit)</span>
          </button>
        )}
      </div>

      {/* TAB 1: Profile Details */}
      {activeTab === "profile" && (
        <>
          {/* VIEW MODE: Clean, interesting visual layout */}
          {!isEditing ? (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Personal Information */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span>वैयक्तिक तपशील (Personal)</span>
                    </h3>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        पूर्ण नाव
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.name || "माहिती उपलब्ध नाही"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        ईमेल पत्ता
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.email}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        मोबाईल नंबर
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.phone || <span className="italic text-slate-400">नोंदवला नाही</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        पसंतीची भाषा
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.preferredLanguage === "en" ? "English" : "मराठी (Marathi)"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic & Exam Details */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                      <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <span>परीक्षेची तयारी व पात्रता (Exam & Education)</span>
                    </h3>
                  </div>

                  <div className="mt-4 space-y-3.5">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        लक्ष्य परीक्षा (Target Exam)
                      </div>
                      <div className="mt-0.5 inline-block rounded-xl bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                        {form.targetExam || "परीक्षा निवडलेली नाही"}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        शिक्षण पात्रता (Education)
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.education || <span className="italic text-slate-400">निवडलेली नाही</span>}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        जिल्हा व तालुका
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                        {form.district ? `${form.taluka ? `${form.taluka}, ` : ""}${form.district}` : (
                          <span className="italic text-slate-400">जिल्हा नोंदवला नाही</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photo & Edit Action Card */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3.5">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      माहितीमध्ये बदल करायचा आहे का?
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      आपले नाव, परीक्षा, जिल्हा किंवा इतर तपशील अपडेट करण्यासाठी खालील बटणावर क्लिक करा.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <label
                    htmlFor="profile-avatar-input"
                    className="flex-1 sm:flex-none text-center cursor-pointer rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    फोटो बदला
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-glow transition hover:bg-blue-500 active:scale-95"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>प्रोफाइल एडिट करा</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* EDIT MODE: Displays only when 'Edit' is triggered */
            <form onSubmit={handleSave} className="space-y-6 animate-in fade-in-50 duration-200">
              {/* Personal Details */}
              <div className="rounded-3xl border border-blue-200 bg-white p-6 shadow-sm dark:border-blue-900/50 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                      <Edit3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span>माहिती संपादित करा (Edit Details)</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      आपले नाव, संपर्क आणि परीक्षा माहिती अद्ययावत करा.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5" />
                    <span>रद्द करा (Cancel)</span>
                  </button>
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      पूर्ण नाव (Full Name) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="उदा. राहुल शिंदे"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      ईमेल पत्ता (Email)
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
                      मोबाईल नंबर (Phone)
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

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      टार्गेट परीक्षा (Target Exam)
                    </label>
                    <select
                      value={form.targetExam}
                      onChange={(e) => setForm({ ...form, targetExam: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                    >
                      <option value="">-- परीक्षा निवडा --</option>
                      {targetExams.map((ex) => (
                        <option key={ex} value={ex}>
                          {ex}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      शिक्षण / पात्रता (Education Qualification)
                    </label>
                    <select
                      value={form.education}
                      onChange={(e) => setForm({ ...form, education: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                    >
                      <option value="">-- शिक्षण निवडा --</option>
                      {educationList.map((ed) => (
                        <option key={ed} value={ed}>
                          {ed}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      जिल्हा (District)
                    </label>
                    <select
                      value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                    >
                      <option value="">-- जिल्हा निवडा --</option>
                      {maharashtraDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      तालुका / शहर (Taluka / City)
                    </label>
                    <input
                      type="text"
                      value={form.taluka}
                      onChange={(e) => setForm({ ...form, taluka: e.target.value })}
                      placeholder="उदा. हवेली, बारामती"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/50"
                    />
                  </div>
                </div>

                {/* Edit Form Action Buttons */}
                <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="rounded-2xl border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    रद्द करा (Cancel)
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-2.5 text-xs font-bold text-white shadow-glow transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>बदल सेव्ह होत आहेत...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>माहिती सेव्ह करा (Save Changes)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </>
      )}

      {/* TAB 2: Security, 2FA, Passkeys & Password */}
      {activeTab === "security" && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Two-Factor Authentication (MFA) */}
          <MfaManager />

          {/* Change Password Card */}
          <ChangePasswordCard />

          {/* Passkey & Biometrics Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <PasskeyManager />
          </div>
        </div>
      )}
    </div>
  );
}
