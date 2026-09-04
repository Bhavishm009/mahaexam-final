"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      <main className="grid min-h-[50vh] place-items-center text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2 font-medium">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span>Loading coaching dashboard...</span>
        </div>
      </main>
    );
  }

  const nav = [
    ["overview", "Overview"],
    ["students", "Students"],
    ["batches", "Batches"],
    ["exams", "Exams"],
    ["questions", "Question Bank"],
    ["payments", "Payments"],
  ];

  return (
    <main className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
            {nav.find((x) => x[0] === tab)?.[1]}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Manage your coaching institute from one place.
          </p>
        </div>
        <Link
          href="/coaching/exam-builder"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 active:scale-95 sm:text-sm"
        >
          + Create Exam
        </Link>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {nav.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition sm:text-sm ${
              tab === id
                ? "bg-slate-900 text-white shadow-sm dark:bg-blue-600 dark:text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && <Overview data={data} />}
      {tab === "students" && <Students students={students} />}
      {tab === "batches" && <Batches batches={batches} />}
      {tab === "exams" && <Exams exams={exams} />}
      {tab === "questions" && <Questions q={questions} />}
      {tab === "payments" && <Payments payments={data.recentPayments || []} />}
    </main>
  );
}

function Overview({ data }) {
  const cards = [
    ["Students", data.counts?.students || 0],
    ["Active Batches", data.counts?.batches || 0],
    ["Questions", data.counts?.questions || 0],
    ["Upcoming Exams", data.counts?.upcomingExams || 0],
    ["Live Exams", data.counts?.liveExams || 0],
    ["Revenue", `₹${((data.revenue?.amount || 0) / 100).toLocaleString("en-IN")}`],
    ["Payments", data.revenue?.payments || 0],
    ["Avg. Score", `${data.averagePercentage || 0}%`],
  ];

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c[0]}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{c[0]}</div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {c[1]}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Recent Exams">
          {data.recentExams?.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between border-b border-slate-100 py-3.5 dark:border-slate-800"
            >
              <div>
                <b className="text-sm font-bold text-slate-900 dark:text-white">{e.title}</b>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {e.totalQuestions} questions · {e.durationMinutes} min
                </div>
              </div>
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                {e.status}
              </span>
            </div>
          ))}
        </Panel>

        <Panel title="Recent Payments">
          {data.recentPayments?.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between border-b border-slate-100 py-3.5 dark:border-slate-800"
            >
              <div>
                <b className="text-sm font-bold text-slate-900 dark:text-white">
                  {p.user?.name || "Student"}
                </b>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {p.exam?.title || "Exam"}
                </div>
              </div>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ₹{((p.amount || 0) / 100).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </>
  );
}

function Students({ students }) {
  return (
    <Panel title={`Students (${students.length})`}>
      <Table headers={["Name", "Email", "Status", "Joined"]}>
        {students.map((s) => (
          <tr key={s.id} className="border-t border-slate-100 dark:border-slate-800">
            <td className="p-3 font-semibold text-slate-900 dark:text-white">{s.name}</td>
            <td className="text-slate-600 dark:text-slate-300">{s.email}</td>
            <td>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                {s.status}
              </span>
            </td>
            <td className="text-slate-500 dark:text-slate-400">
              {new Date(s.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Batches({ batches }) {
  return (
    <Panel title={`Batches (${batches.length})`}>
      <Table headers={["Batch", "Students", "Status"]}>
        {batches.map((b) => (
          <tr key={b.id} className="border-t border-slate-100 dark:border-slate-800">
            <td className="p-3 font-semibold text-slate-900 dark:text-white">{b.name}</td>
            <td className="text-slate-600 dark:text-slate-300">{b.students?.length || 0}</td>
            <td>
              <span className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                {b.status}
              </span>
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Exams({ exams }) {
  return (
    <Panel title={`Exams (${exams.length})`}>
      <Table headers={["Exam", "Status", "Questions", "Start", "Price", "Actions"]}>
        {exams.map((e) => (
          <tr key={e.id} className="border-t border-slate-100 dark:border-slate-800">
            <td className="p-3 font-semibold text-slate-900 dark:text-white">{e.title}</td>
            <td>
              <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {e.status}
              </span>
            </td>
            <td className="text-slate-600 dark:text-slate-300">{e.totalQuestions}</td>
            <td className="text-slate-500 dark:text-slate-400">
              {e.startAt ? new Date(e.startAt).toLocaleString() : "—"}
            </td>
            <td className="font-semibold text-slate-900 dark:text-white">
              ₹{(Number(e.price || 0) / 100).toLocaleString("en-IN")}
            </td>
            <td>
              <Link
                className="font-bold text-blue-600 hover:underline dark:text-blue-400"
                href={`/coaching/results/${e.id}`}
              >
                Results
              </Link>
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Questions({ q }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {q &&
        Object.entries(q).map(([k, v]) => (
          <div
            key={k}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-xs font-medium capitalize text-slate-500 dark:text-slate-400">
              {k}
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white sm:text-3xl">
              {v}
            </div>
          </div>
        ))}
    </div>
  );
}

function Payments({ payments }) {
  return (
    <Panel title="Recent Payments">
      <Table headers={["Student", "Exam", "Amount", "Status", "Date"]}>
        {payments.map((p) => (
          <tr key={p.id} className="border-t border-slate-100 dark:border-slate-800">
            <td className="p-3 font-medium text-slate-900 dark:text-white">{p.user?.name}</td>
            <td className="text-slate-600 dark:text-slate-300">{p.exam?.title || "—"}</td>
            <td className="font-bold text-emerald-600 dark:text-emerald-400">
              ₹{((p.amount || 0) / 100).toLocaleString("en-IN")}
            </td>
            <td>
              <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                {p.status}
              </span>
            </td>
            <td className="text-slate-500 dark:text-slate-400">
              {new Date(p.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-base font-black text-slate-900 dark:text-white sm:text-lg">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Table({ headers, children }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{children}</tbody>
      </table>
    </div>
  );
}
