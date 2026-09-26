"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Medal, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
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

export default function Leaderboard({ searchParams }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(searchParams).then((sp) => {
      const examId = sp?.examId || "police-01";
      fetch(`/api/exams/${examId}/leaderboard`)
        .then((r) => r.json())
        .then((d) => {
          setRows(d.leaderboard || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [searchParams]);

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-indigo-700 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur-md">
                <Trophy className="h-3.5 w-3.5 text-amber-200" />
                State-Level Hall of Fame
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">Maharashtra Exam Leaderboard</h1>
              <p className="mt-1 text-xs text-amber-100 sm:text-sm">
                Top rankers across Maharashtra state mock exams and coaching tests.
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              <Link href="/student/dashboard" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-500" />
              <CardTitle>Top Performers (सर्वोत्कृष्ट विद्यार्थी)</CardTitle>
            </div>
            <CardDescription>Verified highest scoring candidates</CardDescription>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="grid min-h-[30vh] place-items-center">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span>Loading leaderboard...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Rank</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead className="text-right">Percentile</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((x) => (
                      <TableRow key={x.id}>
                        <TableCell className="font-black text-slate-900 dark:text-white">
                          <span
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-xl font-bold ${
                              x.rank === 1
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : x.rank === 2
                                  ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                  : x.rank === 3
                                    ? "bg-amber-50 text-amber-900 dark:bg-amber-950/60 dark:text-amber-400"
                                    : "text-slate-500"
                            }`}
                          >
                            #{x.rank}
                          </span>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-white">
                          {x.student?.name || "Student"}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {x.score}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-700 dark:text-slate-300">
                          {x.percentile ?? "—"}%
                        </TableCell>
                      </TableRow>
                    ))}
                    {!rows.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-12 text-center text-xs text-slate-400">
                          Leaderboard data will be published as soon as students complete attempts.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
