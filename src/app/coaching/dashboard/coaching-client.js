"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Layers3,
  FileText,
  Database,
  CreditCard,
  Plus,
  LayoutDashboard,
  Calendar,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export function CoachingDashboardClient({ initialData }) {
  const [data, setData] = useState(initialData || null);
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState(null);

  useEffect(() => {
    if (!initialData) {
      loadOverview();
    }
    loadStudents();
    loadBatches();
    loadExams();
    loadQuestions();
  }, [initialData]);

  async function loadOverview() {
    const r = await fetch("/api/coaching/dashboard");
    setData(await r.json());
  }

  async function loadStudents() {
    const r = await fetch("/api/coaching/students");
    setStudents((await r.json()).students || []);
  }

  async function loadBatches() {
    const r = await fetch("/api/coaching/batches");
    setBatches((await r.json()).batches || []);
  }

  async function loadExams() {
    const r = await fetch("/api/coaching/exams");
    setExams((await r.json()).exams || []);
  }

  async function loadQuestions() {
    const r = await fetch("/api/coaching/questions/summary");
    setQuestions(await r.json());
  }

  if (!data) {
    return (
      <main className="grid min-h-[50vh] place-items-center text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Loading coaching dashboard...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Top Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Coaching Academy Dashboard
          </h1>
          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
            Manage your coaching institute, students, question banks, and live examinations.
          </p>
        </div>
        <Button asChild size="default" className="shadow-sm">
          <Link href="/coaching/exam-builder" className="gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Create New Exam</span>
          </Link>
        </Button>
      </header>

      {/* Tabs Navigation */}
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="h-auto w-full flex-wrap justify-start overflow-x-auto p-1">
          <TabsTrigger value="overview" className="gap-2 text-xs">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2 text-xs">
            <Users className="h-3.5 w-3.5" />
            <span>Students ({students.length})</span>
          </TabsTrigger>
          <TabsTrigger value="batches" className="gap-2 text-xs">
            <Layers3 className="h-3.5 w-3.5" />
            <span>Batches ({batches.length})</span>
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2 text-xs">
            <FileText className="h-3.5 w-3.5" />
            <span>Exams ({exams.length})</span>
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-2 text-xs">
            <Database className="h-3.5 w-3.5" />
            <span>Question Bank</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2 text-xs">
            <CreditCard className="h-3.5 w-3.5" />
            <span>Payments</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Overview data={data} />
        </TabsContent>
        <TabsContent value="students">
          <Students students={students} />
        </TabsContent>
        <TabsContent value="batches">
          <Batches batches={batches} />
        </TabsContent>
        <TabsContent value="exams">
          <Exams exams={exams} />
        </TabsContent>
        <TabsContent value="questions">
          <Questions q={questions} />
        </TabsContent>
        <TabsContent value="payments">
          <Payments payments={data.recentPayments || []} />
        </TabsContent>
      </Tabs>
    </main>
  );
}

function Overview({ data }) {
  const cards = [
    {
      label: "Enrolled Students",
      value: data.counts?.students || 0,
      icon: Users,
      note: "Total registered students",
    },
    {
      label: "Active Batches",
      value: data.counts?.batches || 0,
      icon: Layers3,
      note: "Classroom cohorts",
    },
    {
      label: "Question Bank",
      value: data.counts?.questions || 0,
      icon: Database,
      note: "MCQs & descriptive",
    },
    {
      label: "Upcoming Exams",
      value: data.counts?.upcomingExams || 0,
      icon: Calendar,
      note: "Scheduled tests",
    },
    {
      label: "Live Exams Now",
      value: data.counts?.liveExams || 0,
      icon: Sparkles,
      note: "In progress",
    },
    {
      label: "Total Revenue",
      value: `₹${((data.revenue?.amount || 0) / 100).toLocaleString("en-IN")}`,
      icon: IndianRupee,
      note: "Collected fees",
    },
    {
      label: "Paid Transactions",
      value: data.revenue?.payments || 0,
      icon: CreditCard,
      note: "Successful orders",
    },
    {
      label: "Average Score",
      value: `${data.averagePercentage || 0}%`,
      icon: TrendingUp,
      note: "Overall cohort score",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} note={c.note} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Exams</CardTitle>
            <CardDescription>Latest published and scheduled examinations</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {!data.recentExams || data.recentExams.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No exams created yet.</p>
            ) : (
              data.recentExams.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {e.title}
                    </span>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {e.totalQuestions} questions · {e.durationMinutes} min
                    </div>
                  </div>
                  <Badge variant="info">{e.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Real-time incoming student registrations</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 dark:divide-slate-800">
            {!data.recentPayments || data.recentPayments.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">No payment records yet.</p>
            ) : (
              data.recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {p.user?.name || "Student"}
                    </span>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {p.exam?.title || "Exam Enrollment"}
                    </div>
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                    ₹{((p.amount || 0) / 100).toLocaleString("en-IN")}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Students({ students }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
        <CardDescription>Complete roster of registered academy students</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-xs text-slate-400">
                    No students enrolled yet.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{s.email}</TableCell>
                    <TableCell>
                      <Badge variant="success">{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Batches({ batches }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Academy Batches</CardTitle>
        <CardDescription>Configured classroom sections and cohorts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Name</TableHead>
                <TableHead>Students Count</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-xs text-slate-400">
                    No active batches found.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {b.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {b.students?.length || 0} students
                    </TableCell>
                    <TableCell>
                      <Badge variant="info">{b.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Exams({ exams }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Examinations</CardTitle>
        <CardDescription>Academy-specific tests and mock assessments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-xs text-slate-400">
                    No exams found.
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {e.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{e.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {e.totalQuestions}
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {e.startAt ? new Date(e.startAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      ₹{(Number(e.price || 0) / 100).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                          <Link href={`/coaching/exams/${e.id}/questions`}>Manage Paper</Link>
                        </Button>
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Link href={`/coaching/results/${e.id}`}>Results</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function Questions({ q }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {q &&
        Object.entries(q).map(([k, v]) => (
          <StatCard key={k} label={k.replace(/([A-Z])/g, " $1").trim()} value={v} icon={Database} />
        ))}
    </div>
  );
}

function Payments({ payments }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Student Payments</CardTitle>
        <CardDescription>Direct Razorpay receipts and enrollments</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Exam Title</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-xs text-slate-400">
                    No recent payments recorded.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-white">
                      {p.user?.name}
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">
                      {p.exam?.title || "—"}
                    </TableCell>
                    <TableCell className="font-black text-emerald-600 dark:text-emerald-400">
                      ₹{((p.amount || 0) / 100).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="success">{p.status}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
