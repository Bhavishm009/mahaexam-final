"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, User, Mail, Phone, Lock, MapPin, Check } from "lucide-react";

export default function JoinInvitePage({ params }) {
  const unwrappedParams = use(params);
  const code = unwrappedParams.code;
  const router = useRouter();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    targetExam: "Maharashtra Police Bharti",
    district: "",
    taluka: "",
  });

  useEffect(() => {
    fetch(`/api/join?code=${code}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
        } else {
          setData(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("इन्व्हाईट लिंक लोड करताना अडचण आली.");
        setLoading(false);
      });
  }, [code]);

  async function handleJoinExisting() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "अकॅडेमीमध्ये सामील होता आले नाही.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(json.message || "तुम्ही यशस्वीरित्या अकॅडेमीमध्ये सामील झाला आहात!");
      setTimeout(() => {
        router.push(json.redirect || "/student/academies");
        router.refresh();
      }, 1500);
    } catch {
      setError("नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.");
      setSubmitting(false);
    }
  }

  async function handleRegisterAndJoin(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          ...regForm,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "नोंदणी अयशस्वी झाली.");
        setSubmitting(false);
        return;
      }

      setSuccessMsg(json.message || "नोंदणी यशस्वी! अकॅडेमीमध्ये सामील केले गेले आहे.");
      setTimeout(() => {
        router.push(json.redirect || "/student/academies");
        router.refresh();
      }, 1500);
    } catch {
      setError("नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto flex w-full max-w-4xl flex-1 items-center justify-center px-4 py-10 sm:px-6">
        {loading ? (
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-slate-500 dark:text-slate-400">
              अकॅडेमी आमंत्रण लोड होत आहे...
            </p>
          </div>
        ) : error && !data ? (
          <div className="w-full max-w-md rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-lg dark:border-rose-900/50 dark:bg-slate-900">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              ✕
            </div>
            <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
              अवैध किंवा मुदत संपलेली लिंक
            </h3>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{error}</p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-500"
            >
              मुख्यपृष्ठावर जा
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-6">
            {/* Coaching Header Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>अधिकृत अकॅडेमी आमंत्रण (Official Invite)</span>
                  </div>
                  <h1 className="mt-3 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
                    {data.invite?.organization?.name || "Coaching Academy"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    {data.invite?.organization?.district && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-rose-500" />
                        {data.invite.organization.district}
                      </span>
                    )}
                    {data.invite?.batch?.name && (
                      <span className="rounded-lg bg-blue-50 px-2.5 py-0.5 font-bold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                        बॅच: {data.invite.batch.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="text-[10px] font-bold text-slate-400">आमंत्रण कोड</div>
                  <div className="font-mono text-xl font-black text-amber-600 dark:text-amber-400">
                    {data.invite?.code}
                  </div>
                </div>
              </div>
            </div>

            {/* Error / Success Alerts */}
            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/80 dark:text-rose-300">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-300">
                <Check className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* If Student is Already Logged In */}
            {data.currentUser ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      लॉगिन खाते: {data.currentUser.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {data.currentUser.email || data.currentUser.phone}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300">
                  तुम्ही या चालू खात्याद्वारे <strong>{data.invite?.organization?.name}</strong>{" "}
                  मध्ये त्वरित सामील होऊ शकता. तुमचा जुना रेकॉर्ड आणि इतर अकॅडेमी तशाच राहतील.
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleJoinExisting}
                    disabled={submitting}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                  >
                    <span>
                      {submitting
                        ? "सामील होत आहे..."
                        : `होय, ${data.invite?.organization?.name || "अकॅडेमी"}मध्ये सामील व्हा`}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/login"
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-center text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    दुसरे खाते वापरा
                  </Link>
                </div>
              </div>
            ) : (
              /* If New Student or Guest */
              <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                {/* Registration Form */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    नवीन विद्यार्थी नोंदणी व बॅच जॉइन
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    खाते तयार करा आणि थेट अकॅडेमीच्या टेस्ट्स सोडवणे सुरू करा.
                  </p>

                  <form onSubmit={handleRegisterAndJoin} className="mt-6 space-y-4">
                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        पूर्ण नाव
                      </label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          value={regForm.name}
                          onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                          placeholder="उदा. राहुल शिंदे"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          ईमेल आयडी
                        </label>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            required
                            type="email"
                            value={regForm.email}
                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                            placeholder="rahul@example.com"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          मोबाईल नंबर
                        </label>
                        <div className="relative">
                          <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            required
                            type="tel"
                            value={regForm.phone}
                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                            placeholder="98XXXXXXXX"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        पासवर्ड तयार करा
                      </label>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          required
                          type="password"
                          value={regForm.password}
                          onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                          placeholder="••••••••"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                        लक्ष्य परीक्षा (Target Exam)
                      </label>
                      <select
                        value={regForm.targetExam}
                        onChange={(e) => setRegForm({ ...regForm, targetExam: e.target.value })}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                      >
                        <option value="Maharashtra Police Bharti">पोलीस भरती (Maharashtra Police Bharti)</option>
                        <option value="Maharashtra Talathi Bharti">तलाठी भरती (Talathi Bharti)</option>
                        <option value="MPSC Combine Group B & C">MPSC संयुक्त पूर्व परीक्षा (Group B & C)</option>
                        <option value="MPSC Rajyaseva">MPSC राज्यसेवा (Civil Services)</option>
                        <option value="Zilla Parishad Bharti">जिल्हा परिषद भरती (ZP Bharti)</option>
                        <option value="Maharashtra Vanrakshak">वनरक्षक भरती (Forest Guard)</option>
                        <option value="Other Government Exam">इतर स्पर्धा परीक्षा (Other Exam)</option>
                      </select>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          जिल्हा (District)
                        </label>
                        <input
                          value={regForm.district}
                          onChange={(e) => setRegForm({ ...regForm, district: e.target.value })}
                          placeholder="उदा. पुणे / छत्रपती संभाजीनगर"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                          तालुका (Taluka)
                        </label>
                        <input
                          value={regForm.taluka}
                          onChange={(e) => setRegForm({ ...regForm, taluka: e.target.value })}
                          placeholder="उदा. हवेली / शिर्डी"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-50"
                    >
                      <span>
                        {submitting ? "नोंदणी होत आहे..." : "नोंदणी करा आणि अकॅडेमी जॉइन करा"}
                      </span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                {/* Right Already have account login */}
                <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      आधीच खाते आहे का?
                    </h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      जर तुमच्याकडे आधीपासूनच महाएक्झाम खाते असेल, तर लॉगिन करून थेट सामील व्हा.
                    </p>
                  </div>

                  <div className="mt-6">
                    <Link
                      href={`/login?redirect=/join/${code}`}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <span>खात्यात लॉगिन करा</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
