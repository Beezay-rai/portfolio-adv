"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function MfaSettingsPage() {
  const supabase = createClient();
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkMfa() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setMessage(error.message);
      } else {
        setEnabled(
          data.totp.some((factor) => factor.status === "verified")
        );
      }
      setLoading(false);
    }

    void checkMfa();
  }, [supabase]);

  async function resetMfa() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;

      const factors = data.totp.filter(
        (factor) =>
          factor.status === "verified" || factor.status === "unverified"
      );

      for (const factor of factors) {
        const { error: unenrollError } =
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        if (unenrollError) throw unenrollError;
      }

      await supabase.auth.refreshSession();
      setEnabled(false);
      setMessage("MFA has been reset.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to reset MFA."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">
          MFA Settings
        </h1>
        <p className="mt-2 text-ink-soft">
          Reset the authenticator currently linked to this account.
        </p>
      </div>

      <section className="card space-y-5">
        {loading ? (
          <p className="text-sm text-ink-soft">Checking MFA status...</p>
        ) : enabled ? (
          <>
            <p className="text-sm text-green-700">
              MFA is currently enabled.
            </p>
            <button
              type="button"
              onClick={resetMfa}
              disabled={loading}
              className="btn w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting…" : "Reset / Disable MFA"}
            </button>
          </>
        ) : (
          <p className="text-sm text-ink-soft">
            MFA is not currently enabled.
          </p>
        )}

        {message && (
          <p className="text-sm text-ink-soft" role="status">
            {message}
          </p>
        )}
      </section>
    </div>
  );
}
