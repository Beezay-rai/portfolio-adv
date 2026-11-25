"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
  });
  if (error) return { error: "Email or password is incorrect." };

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const hasVerifiedFactor = factors?.totp.some(
    (factor) => factor.status === "verified"
  ) ?? false;

  if (!hasVerifiedFactor) redirect("/mfa");

  const { data: assurance } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assurance?.nextLevel === "aal2" &&
      assurance.currentLevel !== "aal2") redirect("/mfa");

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}


export async function verifyMfa(
  _prev: { error?: string } | undefined,
  formData: FormData
) {
  const supabase = await createClient();

  const code = String(formData.get("code") ?? "");

  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter a valid 6-digit code." };
  }

  // Get user's enrolled TOTP factors
  const { data: factors, error: factorError } =
    await supabase.auth.mfa.listFactors();

  if (factorError) {
    return { error: factorError.message };
  }

  const factor = factors.totp.find(
    (item) => item.status === "verified"
  );

  if (!factor) {
    return { error: "No verified authenticator found." };
  }

  // Create MFA challenge
  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

  if (challengeError) {
    return { error: challengeError.message };
  }

  // Verify OTP
  const { error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code,
    });

  if (verifyError) {
    return { error: "Invalid or expired authentication code." };
  }

  redirect("/admin");
}