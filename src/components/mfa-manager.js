"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Key,
  Copy,
  Check,
  Download,
  Loader2,
  Lock,
  X,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function MfaManager({ initialEnabled = false }) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(true);

  // Setup modal state
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [setupStep, setSetupStep] = useState(1); // 1: QR & Secret, 2: Verify Code, 3: Backup Codes
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Disable modal state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/auth/profile");
        const data = await res.json();
        if (res.ok && data.profile) {
          setEnabled(Boolean(data.profile.mfaEnabled));
        }
      } catch {
        // Fallback to initial
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  async function startSetup() {
    setSetupLoading(true);
    try {
      const res = await fetch("/api/auth/mfa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initiate MFA setup");
      }
      setSetupData(data);
      setSetupStep(1);
      setVerifyCode("");
      setShowSetupModal(true);
    } catch (err) {
      toast.error(err.message || "Could not generate MFA setup keys");
    } finally {
      setSetupLoading(false);
    }
  }

  async function handleVerifySetup(e) {
    e.preventDefault();
    if (!verifyCode || verifyCode.trim().length !== 6) {
      toast.error("Please enter the complete 6-digit code from your app");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/auth/mfa/verify-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: verifyCode.trim(),
          setupTicket: setupData?.setupTicket,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid code");
      }

      setEnabled(true);
      setSetupStep(3); // Show backup recovery codes
      toast.success("Two-Factor Authentication activated successfully!");
    } catch (err) {
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function handleDisable(e) {
    e.preventDefault();
    if (!disablePassword) {
      toast.error("Please enter your account password to confirm");
      return;
    }

    setDisabling(true);
    try {
      const res = await fetch("/api/auth/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to disable MFA");
      }

      setEnabled(false);
      setShowDisableModal(false);
      setDisablePassword("");
      toast.success("Two-Factor Authentication has been disabled");
    } catch (err) {
      toast.error(err.message || "Failed to disable MFA");
    } finally {
      setDisabling(false);
    }
  }

  function copySecretKey() {
    if (!setupData?.secretKey) return;
    navigator.clipboard.writeText(setupData.secretKey);
    setCopiedKey(true);
    toast.success("Secret key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2500);
  }

  function copyBackupCodes() {
    if (!setupData?.backupCodes) return;
    const text = setupData.backupCodes.join("\n");
    navigator.clipboard.writeText(text);
    setCopiedBackup(true);
    toast.success("Backup codes copied to clipboard");
    setTimeout(() => setCopiedBackup(false), 2500);
  }

  function downloadBackupCodes() {
    if (!setupData?.backupCodes) return;
    const content = `MAHAEXAM TWO-FACTOR AUTHENTICATION BACKUP CODES\nGenerated: ${new Date().toLocaleString()}\n\nEach code can only be used once if you lose access to your authenticator app:\n\n${setupData.backupCodes.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nKeep these codes strictly private.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mahaexam-mfa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Backup codes file downloaded");
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
                Two-Factor Authentication (MFA / 2FA)
              </h2>
              {loading ? (
                <span className="h-5 w-16 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              ) : enabled ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Active & Protected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  Not Enabled
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Secure your account using standard authenticator apps like Google Authenticator,
              Microsoft Authenticator, Authy, or 1Password.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {enabled ? (
            <button
              type="button"
              onClick={() => setShowDisableModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Disable 2FA</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={setupLoading}
              onClick={startSetup}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-60"
            >
              {setupLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="h-4 w-4" />
              )}
              <span>Enable Authenticator 2FA</span>
            </button>
          )}
        </div>
      </div>

      {/* Info Callout */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-800/40">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {enabled
              ? "Your account has strong multi-factor protection active. Whenever you sign in, you will be prompted for a 6-digit temporary code from your mobile authenticator app."
              : "We highly recommend activating 2FA for Super Admin and Coaching Admin accounts to prevent unauthorized access even if your password is compromised."}
          </p>
        </div>
      </div>

      {/* SETUP MODAL */}
      {showSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <button
              type="button"
              onClick={() => setShowSetupModal(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            {/* STEP 1: Scan QR Code & View Secret Key */}
            {setupStep === 1 && (
              <div>
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                    Step 1: Scan QR Code
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Open Google Authenticator, Microsoft Authenticator, or Authy on your phone and
                    scan this QR code.
                  </p>
                </div>

                {/* QR Code Frame */}
                {(setupData?.qrCodeDataUrl || setupData?.qrCodeSvg) && (
                  <div className="mt-6 flex justify-center">
                    <div className="flex items-center justify-center overflow-hidden rounded-2xl border-4 border-slate-100 bg-white p-3 shadow-md dark:border-slate-800">
                      {setupData.qrCodeDataUrl ? (
                        <img
                          src={setupData.qrCodeDataUrl}
                          alt="2FA QR Code"
                          width={220}
                          height={220}
                          className="h-[220px] w-[220px] rounded-lg object-contain"
                        />
                      ) : (
                        <div
                          className="h-[220px] w-[220px]"
                          dangerouslySetInnerHTML={{ __html: setupData.qrCodeSvg }}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Manual Secret Key */}
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Cannot scan? Enter key manually:
                    </span>
                    <button
                      type="button"
                      onClick={copySecretKey}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1.5 select-all break-all font-mono text-xs font-bold tracking-wider text-slate-800 dark:text-slate-200">
                    {setupData?.secretKey}
                  </p>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSetupModal(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupStep(2)}
                    className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500"
                  >
                    Next: Enter 6-Digit Code →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Verify Code from App */}
            {setupStep === 2 && (
              <form onSubmit={handleVerifySetup}>
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                    <Key className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                    Step 2: Enter Verification Code
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Enter the current 6-digit verification code showing in your authenticator app to
                    activate 2FA.
                  </p>
                </div>

                <div className="mt-6">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    autoFocus
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 text-center font-mono text-2xl font-black tracking-widest text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setSetupStep(1)}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    ← Back to QR
                  </button>
                  <button
                    type="submit"
                    disabled={verifying || verifyCode.length !== 6}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-500 disabled:opacity-50"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <span>Verify & Activate</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Backup Recovery Codes */}
            {setupStep === 3 && (
              <div>
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                    Step 3: Save Backup Recovery Codes
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    If you lose your phone or switch devices, each one-time backup code can be used
                    once to sign into your account.
                  </p>
                </div>

                {/* Codes Grid */}
                <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                  <div className="grid grid-cols-2 gap-2">
                    {setupData?.backupCodes?.map((code, idx) => (
                      <div
                        key={idx}
                        className="shadow-2xs rounded-xl border border-slate-200 bg-white px-3 py-2 text-center font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {code}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={copyBackupCodes}
                      className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {copiedBackup ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy All</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={downloadBackupCodes}
                      className="shadow-2xs inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download .txt</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSetupModal(false);
                      setSetupData(null);
                    }}
                    className="w-full rounded-2xl bg-emerald-600 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500"
                  >
                    I Have Safely Saved My Codes — Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DISABLE MODAL */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition-all dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <button
              type="button"
              onClick={() => setShowDisableModal(false)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900 dark:text-white">
                Disable Two-Factor Authentication?
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Disabling 2FA will reduce your account security. Please enter your account password
                to confirm.
              </p>
            </div>

            <form onSubmit={handleDisable} className="mt-6">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Account Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 outline-none transition focus:border-rose-600 focus:bg-white focus:ring-2 focus:ring-rose-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-rose-500 dark:focus:ring-rose-900/40"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDisableModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Keep 2FA
                </button>
                <button
                  type="submit"
                  disabled={disabling || !disablePassword}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-rose-500 disabled:opacity-50"
                >
                  {disabling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Disabling...</span>
                    </>
                  ) : (
                    <span>Confirm Disable</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
