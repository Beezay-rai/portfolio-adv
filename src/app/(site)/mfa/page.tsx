
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

export default function MfaVerificationPage() {
  const supabase = createClient();
  const router = useRouter();

  const [factorId, setFactorId] = useState("");
  const [qrUri, setQrUri] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkFactors() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setMessage(error.message);
      } else {
        setEnabled(
          data.totp.some((factor) => factor.status === "verified")
        );
      }
      setChecking(false);
      setLoading(false);
    }

    void checkFactors();
  }, [supabase]);

  async function enableMfa() {
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Authenticator",
      });
      if (error) throw error;

      setFactorId(data.id);
      setQrUri(data.totp.uri);
      setMessage("Scan the QR code with your authenticator app.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to enable MFA."
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode() {
    setLoading(true);
    setMessage("");

    try {
      let factorIdToVerify = factorId;

      if (!factorIdToVerify) {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const factor = data.totp.find(
          (item) => item.status === "verified"
        );
        if (!factor) throw new Error("No verified authenticator found.");
        factorIdToVerify = factor.id;
      }

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId: factorIdToVerify });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factorIdToVerify,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;

      setEnabled(true);
      setQrUri("");
      setCode("");
      setVerified(true);
      setMessage("MFA is enabled. You can continue to the admin.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Verification failed."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto mt-20 max-w-sm px-6">
      <div className="card space-y-5" aria-busy={loading}>

        <div className="text-center">
          <h1 className="text-2xl font-bold">
            Two-Factor Authentication
          </h1>

          <p className="mt-2 text-sm text-ink-soft">
            {enabled
              ? "MFA is enabled for this account."
              : qrUri
                ? "Scan the QR code and enter the 6-digit code."
                : "Secure your account with an authenticator app."}
          </p>
        </div>

        {checking && (
          <p className="flex items-center justify-center gap-2 text-sm text-ink-soft" role="status">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Checking MFA status…
          </p>
        )}

        {!checking && !enabled && !qrUri && (
          <button
            type="button"
            onClick={enableMfa}
            disabled={loading}
            className="btn w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Preparing MFA…" : "Enable MFA"}
          </button>
        )}

        {qrUri && (
          <>
            <div className="flex justify-center rounded-lg bg-white p-4">
              <QRCodeSVG value={qrUri} size={220} />
            </div>
            <label htmlFor="otp" className="label">
              Authentication Code
            </label>
          </>
        )}

        {(!checking && (enabled || qrUri)) ? (
          <div>
            <label htmlFor="otp" className="label">
              Authentication Code
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              disabled={loading}
              placeholder="123456"
              className="input text-center tracking-widest disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        ) : null}

        {message && (
          <p className="text-sm text-red-600" role="alert">
            {message}
          </p>
        )}

        {verified ? (
          <button
            type="button"
            onClick={() => {
              router.replace("/admin");
              router.refresh();
            }}
            className="btn w-full"
          >
            Continue to Admin
          </button>
        ) : enabled ? (
          <button
            type="button"
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
            className="btn w-full"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>
        ) : qrUri ? (
          <button
            type="button"
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
            className="btn w-full"
          >
            {loading ? "Verifying..." : "Verify & Enable MFA"}
          </button>
        ) : null}

      </div>
    </main>
  );
}
