"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  Copy,
  Check,
  Sparkles,
  Search,
  Share2,
  AlertCircle,
  CheckCircle2,
  Info,
  UserX,
  UserCheck,
  Trash2,
  X,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function CoachingStudentsPage() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [invites, setInvites] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    batchId: "",
  });
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState(false);

  // Student management state
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  function load() {
    Promise.all([
      fetch("/api/coaching/students").then((r) => r.json()),
      fetch("/api/coaching/invites").then((r) => r.json()),
    ])
      .then(([stData, invData]) => {
        setStudents(stData.students || []);
        setBatches(invData.batches || []);
        setInvites(invData.invites || []);
        if (invData.batches?.length > 0 && !form.batchId) {
          setForm((f) => ({ ...f, batchId: invData.batches[0].id }));
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addStudent(e) {
    e.preventDefault();
    setAdding(true);
    setAlert({ text: "", type: "" });

    try {
      const r = await fetch("/api/coaching/students/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) {
        setAlert({ text: d.error || "Failed to add student", type: "error" });
      } else if (d.alreadyRegistered) {
        setAlert({
          text:
            d.messageMr ||
            d.message ||
            `हा विद्यार्थी आधीच MahaExam वर नोंदणीकृत आहे! त्याला यशस्वीरित्या ${d.batch?.name || "बॅच"} मध्ये जोडले गेले आहे.`,
          type: "info",
        });
        setForm({ name: "", email: "", phone: "", batchId: batches[0]?.id || "" });
        load();
      } else {
        setAlert({
          text:
            d.messageMr ||
            d.message ||
            `नवीन विद्यार्थी ${d.user?.name} यशस्वीरित्या जोडला गेला! लॉगिन माहिती विद्यार्थ्याला ईमेलवर पाठवली आहे.`,
          type: "success",
        });
        setForm({ name: "", email: "", phone: "", batchId: batches[0]?.id || "" });
        load();
      }
    } catch {
      setAlert({ text: "नेटवर्क त्रुटी आली. कृपया पुन्हा प्रयत्न करा.", type: "error" });
    } finally {
      setAdding(false);
    }
  }

  async function toggleStatus(student) {
    const newStatus = student.academyStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setActionLoadingId(student.id);
    try {
      const res = await fetch(`/api/coaching/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ academyStatus: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({
          text:
            newStatus === "INACTIVE"
              ? `${student.name} या विद्यार्थ्याला अकॅडेमीसाठी निष्क्रिय (Deactivated) केले आहे. त्याचा MahaExam प्लॅटफॉर्म ॲक्सेस चालू राहील पण खाजगी परीक्षा बंद होतील.`
              : `${student.name} या विद्यार्थ्याला अकॅडेमीसाठी पुन्हा सक्रिय (Activated) केले आहे.`,
          type: "info",
        });
        load();
      } else {
        setAlert({ text: data.error || "Failed to update status", type: "error" });
      }
    } catch {
      setAlert({ text: "नेटवर्क त्रुटी आली.", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  }

  async function handleConfirmRemove() {
    if (!studentToRemove) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/coaching/students/${studentToRemove.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        setAlert({
          text: `${studentToRemove.name} या विद्यार्थ्याला तुमच्या अकॅडेमीतून काढून टाकण्यात आले आहे. (टीप: त्याचे MahaExam खाते चालू राहील).`,
          type: "success",
        });
        setStudentToRemove(null);
        load();
      } else {
        setAlert({ text: data.error || "Failed to remove student", type: "error" });
      }
    } catch {
      setAlert({ text: "नेटवर्क त्रुटी आली.", type: "error" });
    } finally {
      setRemoving(false);
    }
  }

  const defaultInvite = invites[0];
  const inviteLink = defaultInvite
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/join/${defaultInvite.code}`
    : "";

  function copyInvite() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareWhatsApp() {
    if (!inviteLink) return;
    const msg = `नमस्कार, आमच्या कोचिंग अकॅडेमीच्या ऑनलाइन बॅच व सराव परीक्षांसाठी खालील लिंकवर जाऊन आपली नोंदणी पूर्ण करा:\n${inviteLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, "_blank");
  }

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search) ||
      s.batchName?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-100 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Student & Batch Management</span>
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-3xl">
              Coaching Students (विद्यार्थी व्यवस्थापन)
            </h1>
            <p className="mt-1 text-xs text-amber-100 sm:text-sm">
              Add students directly, share invite links, and manage student enrollments securely.
            </p>
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-center backdrop-blur-md">
            <div className="text-xs font-semibold text-amber-200">Enrolled Students</div>
            <div className="text-2xl font-black text-white">{students.length} Students</div>
          </div>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alert.text && (
        <div
          className={`flex items-start gap-3 rounded-2xl p-4 text-xs font-bold transition ${
            alert.type === "error"
              ? "border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
              : alert.type === "info"
                ? "border border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-blue-300"
                : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {alert.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          ) : alert.type === "info" ? (
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <div className="flex-1">{alert.text}</div>
          <button
            type="button"
            onClick={() => setAlert({ text: "", type: "" })}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Section: Invite Link Box & Fast Add Student Form */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fast Add Student Box */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base">Add Student (विद्यार्थी जोडा)</CardTitle>
                <CardDescription>Directly add by name and email</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={addStudent} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="st-name">Student Name (नाव) *</Label>
                <Input
                  id="st-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="उदा. राहुल शिंदे"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-email">Email Address (ईमेल) *</Label>
                <Input
                  id="st-email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="rahul@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-phone">Mobile Number (मोबाईल)</Label>
                <Input
                  id="st-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="st-batch">Select Batch (बॅच निवडा)</Label>
                <select
                  id="st-batch"
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={adding}
                className="w-full gap-2 bg-amber-600 font-bold text-white hover:bg-amber-700"
              >
                <UserPlus className="h-4 w-4" />
                <span>{adding ? "Adding..." : "Add Student & Send Email"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right Section: Invite Link Box & Student Directory Table */}
        <div className="space-y-6 lg:col-span-2">
          {/* Invite Link Card */}
          <Card className="border-amber-200/80 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardHeader className="pb-3">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <CardTitle className="text-sm font-black text-slate-900 dark:text-white">
                    Batch Self-Registration Link (विद्यार्थी नोंदणी लिंक)
                  </CardTitle>
                  <CardDescription>
                    Share this link with students. They will fill their own name, email, password,
                    and details.
                  </CardDescription>
                </div>

                {defaultInvite && (
                  <Badge variant="warning" className="font-bold uppercase">
                    Code: {defaultInvite.code}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  readOnly
                  value={inviteLink || "No active invite link"}
                  className="flex-1 bg-white font-mono text-xs dark:bg-slate-900"
                />
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    onClick={copyInvite}
                    disabled={!inviteLink}
                    variant="default"
                    className="gap-1.5 bg-amber-600 text-white hover:bg-amber-700"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-white" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={shareWhatsApp}
                    disabled={!inviteLink}
                    className="gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                    title="Share on WhatsApp"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>WhatsApp</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Directory Table */}
          <Card>
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <CardTitle>Enrolled Students Directory (विद्यार्थी यादी)</CardTitle>
                  <CardDescription>{students.length} total students enrolled</CardDescription>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search students or batch..."
                    className="h-9 pl-9 text-xs"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Target Exam</TableHead>
                      <TableHead>Academy Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered
                      .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                      .map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                              {s.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3 text-slate-400" />
                                  {s.email}
                                </span>
                              )}
                              {s.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-slate-400" />
                                  {s.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="info">{s.batchName || "General Batch"}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{s.targetExam || "Police Bharti"}</Badge>
                          </TableCell>
                          <TableCell>
                            {s.academyStatus === "INACTIVE" ? (
                              <Badge variant="warning" className="gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Inactive
                              </Badge>
                            ) : (
                              <Badge variant="success" className="gap-1">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Active / Inactive Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={actionLoadingId === s.id}
                                onClick={() => toggleStatus(s)}
                                className={`h-7 px-2.5 text-xs font-bold ${
                                  s.academyStatus === "INACTIVE"
                                    ? "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/60"
                                    : "text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/60"
                                }`}
                              >
                                {s.academyStatus === "INACTIVE" ? (
                                  <>
                                    <UserCheck className="mr-1 h-3 w-3" />
                                    <span>Activate</span>
                                  </>
                                ) : (
                                  <>
                                    <UserX className="mr-1 h-3 w-3" />
                                    <span>Deactivate</span>
                                  </>
                                )}
                              </Button>

                              {/* Remove Student from Academy Button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setStudentToRemove(s)}
                                className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/60"
                                title="Remove from Academy"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="p-8 text-center text-xs text-slate-400">
                          No students found. Use the form on the left or share your invite link.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Footer */}
              {filtered.length > pageSize && (
                <div className="flex items-center justify-between pt-4 text-xs">
                  <span className="text-slate-500">
                    Page {currentPage} of {Math.ceil(filtered.length / pageSize)} ({filtered.length}{" "}
                    total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="mr-1 h-3.5 w-3.5" /> Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= Math.ceil(filtered.length / pageSize)}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal: Remove Student from Academy */}
      <Dialog open={!!studentToRemove} onOpenChange={(open) => !open && setStudentToRemove(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <DialogTitle>अकॅडेमीतून विद्यार्थी काढायचा आहे का?</DialogTitle>
            <DialogDescription>
              Remove <strong>{studentToRemove?.name}</strong> from your academy?
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
            <div className="font-bold">महत्त्वाची नोंद (Platform Policy):</div>
            <p className="mt-1 text-[11px] leading-relaxed">
              हा विद्यार्थी फक्त <strong>तुमच्या अकॅडेमीमधून</strong> काढला जाईल आणि त्याचे
              अकॅडेमीचे खाजगी पेपर्स बंद होतील. त्याचे{" "}
              <strong>MahaExam वरील खाते चालूच राहील</strong> व तो सर्व मोफत व ग्लोबल सराव परीक्षा
              देऊ शकेल.
            </p>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={removing}
              onClick={() => setStudentToRemove(null)}
            >
              Cancel (रद्द करा)
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={removing}
              onClick={handleConfirmRemove}
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              <span>{removing ? "काढत आहे..." : "होय, अकॅडेमीतून काढा"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
