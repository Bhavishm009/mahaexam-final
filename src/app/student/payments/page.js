"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, ArrowLeft } from "lucide-react";
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

export default function Payments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/payments")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen space-y-6 font-sans text-slate-900 transition-colors dark:text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-100 backdrop-blur-md">
                <CreditCard className="h-3.5 w-3.5 text-amber-300" />
                Billing & Purchases
              </span>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">
                My Purchases & Payment History
              </h1>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Track payments, invoice receipts, and subscription packages.
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
            <CardTitle>Transaction History (व्यवहार इतिहास)</CardTitle>
            <CardDescription>
              Verified records of exam purchases and active enrolments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid min-h-[30vh] place-items-center">
                <div className="flex items-center gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span>Loading purchases...</span>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Package</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Transaction Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((x) => (
                      <TableRow key={x.id}>
                        <TableCell>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {x.exam?.title || "Exam Package"}
                          </div>
                          {!x.exam || x.exam?.status === "ARCHIVED" ? (
                            <div className="mt-1">
                              <Badge variant="warning">
                                सध्या ही परीक्षा किंवा प्रिव्ह्यू उपलब्ध नाही (Exam not available)
                              </Badge>
                            </div>
                          ) : (
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="success">
                                नेहमी सुरू / अमर्याद प्रयत्न (Always Open)
                              </Badge>
                              <Link
                                href={`/exam/${x.exam.slug || x.exam.id || x.examId}`}
                                className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                              >
                                सुरू करा →
                              </Link>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{((x.amountPaise || 0) / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">{x.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-500 dark:text-slate-400">
                          {new Date(x.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!items.length && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-xs text-slate-400">
                          All currently available mock tests are 100% free. No paid transactions
                          found.
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
