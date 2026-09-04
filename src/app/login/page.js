import { Suspense } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE, verifySessionToken } from "@/lib/auth";
import { LoginForm } from "@/components/auth-form";
import { PublicNavbar } from "@/components/public-navbar";
import { PublicFooter } from "@/components/public-footer";
import { ShieldCheck, Award, Sparkles, CheckCircle2 } from "lucide-react";

export default async function LoginPage() {
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
          {/* Left Visual Branding Card */}
          <div className="relative hidden overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-10 shadow-sm transition-colors dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 lg:block">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-600/20 dark:text-blue-300">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>महाराष्ट्र स्पर्धा परीक्षा पोर्टल</span>
              </div>

              <h1 className="mt-6 text-3xl font-black leading-tight text-slate-900 dark:text-white sm:text-4xl">
                तुमचे ध्येय, आमचा सराव. <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-amber-300">
                  यश तुमचेच आहे!
                </span>
              </h1>

              <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
                पोलीस भरती, MPSC, तलाठी, जिल्हा परिषद आणि सर्व स्पर्धा परीक्षांसाठी महाराष्ट्रातील
                सर्वोत्कृष्ट ऑनलाइन सराव व्यासपीठ.
              </p>

              <div className="mt-8 space-y-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>अस्सल TCS / IBPS परीक्षा स्क्रीन सिम्युलेटर</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>मराठी व इंग्रजी दोन्ही भाषेत उपलब्ध प्रश्न</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>महाराष्ट्र राज्य व जिल्हास्तरीय रँक विश्लेषण</span>
                </div>
              </div>

              <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>सुरक्षित परीक्षा प्रणाली</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span>ISO प्रमाणित दर्जा</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Auth Form */}
          <div className="w-full">
            <Suspense
              fallback={
                <div className="flex justify-center p-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
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
