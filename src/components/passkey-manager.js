"use client";

import { useState, useEffect } from "react";
import { Fingerprint, Trash2, Plus, Smartphone, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { fetchJson } from "@/lib/api-client";
import ConfirmModal from "@/components/confirm-modal";

export function PasskeyManager() {
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  async function loadCredentials() {
    try {
      const { ok, data } = await fetchJson("/api/auth/webauthn/credentials");
      if (ok && data.credentials) {
        setCredentials(data.credentials);
      }
    } catch {
      // ignore fetch errors on mount
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCredentials();
  }, []);

  async function handleRegisterPasskey() {
    if (typeof window === "undefined" || !window.PublicKeyCredential) {
      toast.error("Your browser or device does not support WebAuthn Passkeys / Biometrics.");
      return;
    }

    setRegistering(true);
    try {
      const { ok: optOk, data: options } = await fetchJson("/api/auth/webauthn/register/options", {
        method: "POST",
      });
      if (!optOk || !options?.challenge) {
        throw new Error(options?.error || "Failed to start biometric registration");
      }

      options.challenge = Uint8Array.from(
        atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );
      options.user.id = Uint8Array.from(
        atob(options.user.id.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0),
      );

      const credential = await navigator.credentials.create({
        publicKey: options,
      });

      if (!credential) {
        throw new Error("Biometric registration was cancelled by user");
      }

      const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
      const clientDataJSON = btoa(
        String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON)),
      );
      const attestationObject = btoa(
        String.fromCharCode(...new Uint8Array(credential.response.attestationObject)),
      );

      const { ok: verifyOk, data: d } = await fetchJson("/api/auth/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: credential.id,
          rawId,
          type: credential.type,
          response: { clientDataJSON, attestationObject },
        }),
      });

      if (verifyOk && d.success) {
        toast.success("Biometric / Passkey added successfully!");
        await loadCredentials();
      } else {
        throw new Error(d.error || "Failed to verify biometric registration");
      }
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        toast.error(err.message || "Failed to register passkey.");
      }
    } finally {
      setRegistering(false);
    }
  }

  function handleDeletePasskey(id) {
    setDeleteTargetId(id);
  }

  async function confirmDeletePasskey() {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setDeletingId(id);

    try {
      const { ok, data } = await fetchJson(`/api/auth/webauthn/credentials?id=${id}`, {
        method: "DELETE",
      });

      if (ok && data.success) {
        toast.success("Passkey removed successfully.");
        setCredentials((prev) => prev.filter((c) => c.id !== id));
        setDeleteTargetId(null);
      } else {
        toast.error(data.error || "Failed to delete passkey.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to remove passkey.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
            <Fingerprint className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <span>Passkeys & Biometrics</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Add or manage fingerprint, Touch ID, Face ID, or Windows Hello for instant login.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRegisterPasskey}
          disabled={registering}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-blue-500 active:scale-95 disabled:opacity-60"
        >
          {registering ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Registering Device...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Add New Biometric / Passkey</span>
            </>
          )}
        </button>
      </div>

      {/* Credentials List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span>Loading registered passkeys...</span>
          </div>
        ) : credentials.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/50">
            <Fingerprint className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
            <div className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              No Passkeys Registered Yet
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Add a passkey to sign in instantly with fingerprint or Face ID on this device.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {credentials.map((cred, idx) => (
              <div
                key={cred.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700"
              >
                <div className="flex items-center gap-3.5">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Biometric Credential #{idx + 1}
                      </span>
                      <span className="rounded-md border border-emerald-500/20 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-300">
                        Active
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span>
                        Registered on{" "}
                        {new Date(cred.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {cred.credentialId.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePasskey(cred.id)}
                  disabled={deletingId === cred.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/60"
                  title="Remove this passkey"
                >
                  {deletingId === cred.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">Remove</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Passkey Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Remove Biometric Credential"
        description="Are you sure you want to remove this passkey / biometric credential? You will no longer be able to log in with this device."
        confirmText="Remove Passkey"
        isLoading={!!deletingId}
        onConfirm={confirmDeletePasskey}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
