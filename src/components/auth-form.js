"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Building2, MapPin, Fingerprint } from "lucide-react";
import { MAHARASHTRA_EXAM_TYPES } from "@/lib/exam-types";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "लॉगिन अयशस्वी. कृपया योग्य माहिती तपासा.");
        setLoading(false);
        return;
      }

      const next = params.get("next");
      if (next) {
        router.push(next);
      } else {
        const role = data.user?.role;
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          router.push("/admin");
        } else if (role === "COACHING_ADMIN" || role === "TEACHER") {
          router.push("/coaching/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
      router.refresh();
    } catch {
      setError("नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.");
      setLoading(false);
    }
  }

  async function handlePasskeyLogin() {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      setError("Your browser / device does not support WebAuthn Passkeys.");
      return;
    }

    setBiometricLoading(true);
    setError("");
    try {
      const optRes = await fetch("/api/auth/webauthn/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() || undefined }),
      });
      const options = await optRes.json();
      if (!optRes.ok) {
        throw new Error(options.error || "Failed to initiate passkey authentication");
      }

      const challengeBuffer = Uint8Array.from(
        atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );

      const allowCredentials = (options.allowCredentials || []).map((c) => ({
        ...c,
        id: Uint8Array.from(
          atob(c.id.replace(/-/g, "+").replace(/_/g, "/")),
          (ch) => ch.charCodeAt(0),
        ),
      }));

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: challengeBuffer,
          rpId: options.rpId,
          allowCredentials: allowCredentials.length > 0 ? allowCredentials : undefined,
          userVerification: options.userVerification || "preferred",
          timeout: 60000,
        },
      });

      if (!assertion) {
        throw new Error("No passkey credential returned by device.");
      }

      const rawIdBase64 = btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)));
      const clientDataJSON = btoa(
        String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON)),
      );
      const authenticatorData = btoa(
        String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData)),
      );
      const signature = btoa(
        String.fromCharCode(...new Uint8Array(assertion.response.signature)),
      );

      const authRes = await fetch("/api/auth/webauthn/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: assertion.id,
          rawId: rawIdBase64,
          type: assertion.type,
          response: {
            clientDataJSON,
            authenticatorData,
            signature,
          },
        }),
      });

      const data = await authRes.json();
      if (!authRes.ok) {
        throw new Error(data.error || "Passkey login failed");
      }

      const next = params.get("next");
      if (next) {
        router.push(next);
      } else {
        const role = data.user?.role;
        if (role === "SUPER_ADMIN" || role === "ADMIN") {
          router.push("/admin");
        } else if (role === "COACHING_ADMIN" || role === "TEACHER") {
          router.push("/coaching/dashboard");
        } else {
          router.push("/student/dashboard");
        }
      }
      router.refresh();
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        setError(err.message || "Biometric login was cancelled or failed.");
      }
    } finally {
      setBiometricLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          खात्यात लॉगिन करा (Sign In)
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          ईमेल-पासवर्ड किंवा फिंगरप्रिंट / Face ID द्वारे सुरक्षित लॉगिन करा.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/80 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            ईमेल आयडी (Email Address)
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="bhavishm009@gmail.com"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            पासवर्ड (Password)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || biometricLoading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-60"
        >
          <span>{loading ? "लॉगिन होत आहे..." : "खात्यात लॉगिन करा"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="absolute bg-white px-3 text-[11px] font-bold text-slate-400 dark:bg-slate-900">
            किंवा बायोमेट्रिक (OR)
          </span>
        </div>

        <button
          type="button"
          onClick={handlePasskeyLogin}
          disabled={loading || biometricLoading}
          className="inline-flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 py-3 text-xs font-bold text-slate-800 transition hover:bg-slate-100 active:scale-95 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Fingerprint className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span>{biometricLoading ? "Verifying Fingerprint..." : "Login with Fingerprint / Passkey"}</span>
        </button>
      </form>
    </div>
  );
}

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    targetExam: "Police Bharti",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "नोंदणी अयशस्वी झाली.");
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          विद्यार्थी नोंदणी (Student Register)
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          खाते तयार करा आणि महाराष्ट्रातील सर्वोत्तम सराव परीक्षा द्या.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/80 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            पूर्ण नाव
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              type="text"
              required
              placeholder="उदा. राहुल शिंदे"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              ईमेल आयडी
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                required
                placeholder="rahul@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              मोबाईल नंबर
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                type="tel"
                placeholder="98XXXXXXXX"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            तयारी करत असलेली परीक्षा (Target Exam)
          </label>
          <select
            value={form.targetExam}
            onChange={(e) => setForm({ ...form, targetExam: e.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          >
            {MAHARASHTRA_EXAM_TYPES.map((ex) => (
              <option key={ex.id} value={ex.name} className="bg-white dark:bg-slate-900">
                {ex.nameMr} ({ex.name})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            पासवर्ड तयार करा
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-500 active:scale-95 disabled:opacity-60"
        >
          <span>{loading ? "नोंदणी होत आहे..." : "मोफत खाते तयार करा"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

export function CoachingSignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    organizationName: "",
    adminName: "",
    email: "",
    phone: "",
    district: "Pune",
    password: "",
    isCoaching: true,
    role: "COACHING_ADMIN",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = [
    "पुणे (Pune)",
    "मुंबई (Mumbai)",
    "ठाणे (Thane)",
    "छत्रपती संभाजीनगर (Aurangabad)",
    "नागपूर (Nagpur)",
    "नाशिक (Nashik)",
    "कोल्हापूर (Kolhapur)",
    "सोलापूर (Solapur)",
    "अमरावती (Amravati)",
    "नांदेड (Nanded)",
    "सातारा (Satara)",
    "सांगली (Sangli)",
    "अहमदनगर (Ahmednagar)",
    "जळगाव (Jalgaon)",
    "लातूर (Latur)",
  ];

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "अकॅडेमी नोंदणी अयशस्वी झाली.");
        setLoading(false);
        return;
      }
      router.push("/coaching/dashboard");
      router.refresh();
    } catch {
      setError("नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">
          कोचिंग अकॅडेमी नोंदणी (Academy Registration)
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          अकॅडेमी नोंदवा आणि स्वतःचे CBT टेस्ट पोर्टल तयार करा.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/80 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            अकॅडेमीचे / संस्थेचे नाव
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={form.organizationName}
              onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              type="text"
              required
              placeholder="उदा. सह्याद्री करिअर अकॅडेमी"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              संचालकांचे / मुख्य शिक्षकांचे नाव
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={form.adminName}
                onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                type="text"
                required
                placeholder="उदा. प्रा. किरण माने"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              जिल्हा (District)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              >
                {districts.map((d) => (
                  <option key={d} value={d} className="bg-white dark:bg-slate-900">
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              अधिकृत ईमेल आयडी
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                required
                placeholder="academy@example.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              मोबाईल नंबर
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                type="tel"
                placeholder="98XXXXXXXX"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            पासवर्ड तयार करा
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition focus:border-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-amber-500 active:scale-95 disabled:opacity-60"
        >
          <span>{loading ? "नोंदणी होत आहे..." : "अकॅडेमी रजिस्टर करा"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
