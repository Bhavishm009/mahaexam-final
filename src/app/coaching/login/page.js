import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { LoginForm } from "@/components/auth-form";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { Building2, Sparkles, ShieldCheck, CheckCircle2 } from "lucide-react";

export default async function CoachingLoginPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (session) {
    if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
      redirect("/admin");
    } else if (session.role === "COACHING_ADMIN" || session.role === "TEACHER") {
      redirect("/coaching/dashboard");
    } else {
      redirect("/student/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <PublicNavbar />

      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-5xl items-center gap-8 lg:grid-cols-2">
          {/* Left Hero Card */}
          <div className="relative hidden overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50/60 via-white to-slate-50 p-10 shadow-sm transition-colors dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-amber-950/40 dark:to-slate-900 lg:block">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>अकॅडेमी संचालक व शिक्षक लॉगिन</span>
              </div>

              <h1 className="mt-6 text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">
                कोचिंग अकॅडेमी <br />
                <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:via-amber-300 dark:to-orange-400">
                  डॅशबोर्ड पोर्टल
                </span>
              </h1>

              <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                तुमच्या बॅचेसचे विद्यार्थी, प्रश्नसंच, ऑनलाइन परीक्षा आणि शिक्षक टीमचे एकाच
                ठिकाणाहून व्यवस्थापन करा.
              </p>

              <div className="mt-8 space-y-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>बॅचमधील विद्यार्थ्यांना स्वयंचलित ईमेल व पासवर्ड</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>वेळ मर्यादा आणि निगेटिव्ह मार्किंगसह परीक्षांचे नियोजन</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>रिअल-टाइम निकाल, रँकिंग आणि प्रोग्रेस कार्ड्स</span>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>अकॅडेमी कन्सोल</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>२५६-बिट सुरक्षित</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Login Form */}
          <div className="w-full">
            <Suspense
              fallback={
                <div className="flex justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                </div>
              }
            >
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
