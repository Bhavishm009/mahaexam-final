"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CoachingDashboard() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState(null);

  useEffect(() => {
    loadOverview();
    loadStudents();
    loadBatches();
    loadExams();
    loadQuestions();
  }, []);

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
      <main className="grid min-h-screen place-items-center bg-slate-50">
        Loading coaching dashboard...
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
    <main className="min-h-0 bg-slate-50">
      <section>
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{nav.find((x) => x[0] === tab)?.[1]}</h1>
            <p className="mt-1 text-slate-500">Manage your coaching institute from one place.</p>
          </div>
          <Link
            href="/coaching/exam-builder"
            className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white"
          >
            + Create Exam
          </Link>
        </header>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {nav.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${
                tab === id ? "bg-slate-900 text-white" : "bg-white text-slate-600"
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
      </section>
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
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div key={c[0]} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{c[0]}</div>
            <div className="mt-2 text-3xl font-black">{c[1]}</div>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Recent Exams">
          {data.recentExams?.map((e) => (
            <div key={e.id} className="flex justify-between border-b py-4">
              <div>
                <b>{e.title}</b>
                <div className="mt-1 text-xs text-slate-500">
                  {e.totalQuestions} questions · {e.durationMinutes} min
                </div>
              </div>
              <span className="text-xs font-bold">{e.status}</span>
            </div>
          ))}
        </Panel>
        <Panel title="Recent Payments">
          {data.recentPayments?.map((p) => (
            <div key={p.id} className="flex justify-between border-b py-4">
              <div>
                <b>{p.user?.name || "Student"}</b>
                <div className="text-xs text-slate-500">{p.exam?.title || "Exam"}</div>
              </div>
              <span className="font-bold">₹{((p.amount || 0) / 100).toLocaleString("en-IN")}</span>
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
          <tr key={s.id} className="border-t">
            <td className="p-3 font-semibold">{s.name}</td>
            <td>{s.email}</td>
            <td>{s.status}</td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
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
          <tr key={b.id} className="border-t">
            <td className="p-3 font-semibold">{b.name}</td>
            <td>{b.students?.length || 0}</td>
            <td>{b.status}</td>
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
          <tr key={e.id} className="border-t">
            <td className="p-3 font-semibold">{e.title}</td>
            <td>{e.status}</td>
            <td>{e.totalQuestions}</td>
            <td>{e.startAt ? new Date(e.startAt).toLocaleString() : "—"}</td>
            <td>₹{(Number(e.price || 0) / 100).toLocaleString("en-IN")}</td>
            <td>
              <Link className="font-semibold text-blue-600" href={`/coaching/results/${e.id}`}>
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
          <div key={k} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-sm capitalize text-slate-500">{k}</div>
            <div className="mt-2 text-3xl font-black">{v}</div>
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
          <tr key={p.id} className="border-t">
            <td className="p-3">{p.user?.name}</td>
            <td>{p.exam?.title || "—"}</td>
            <td>₹{((p.amount || 0) / 100).toLocaleString("en-IN")}</td>
            <td>{p.status}</td>
            <td>{new Date(p.createdAt).toLocaleString()}</td>
          </tr>
        ))}
      </Table>
    </Panel>
  );
}

function Panel({ title, children }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Table({ headers, children }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h) => (
              <th key={h} className="p-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
