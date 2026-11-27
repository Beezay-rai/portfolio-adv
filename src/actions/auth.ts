"use server";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
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

export async function sendMfaRecoveryCode() {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user?.email || !user.email_confirmed_at) {
    return { error: "A signed-in account with a verified email is required." };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY) {
    return { error: "Email recovery is not configured. Contact the administrator." };
  }

  const { data: factors, error: factorError } =
    await supabase.auth.mfa.listFactors();

  if (factorError) {
    return { error: factorError.message };
  }

  if (!factors.totp.some((factor) => factor.status === "verified")) {
    return { error: "No verified authenticator is available to recover." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: user.email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    return { error: error.message };
  }

  return { message: "A verification code has been sent to your account email." };
}

export async function recoverMfaWithEmailCode(
  _prev: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const code = String(formData.get("code") ?? "");

  if (!/^\d{6}$/.test(code)) {
    return { error: "Enter a valid 6-digit email code." };
  }

  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    console.log(serviceRoleKey)
    return { error: "Email asd recovery is not configured. Contact the administrator." };
  }

  const supabase = await createClient();
  const { data: { user: originalUser }, error: userError } =
    await supabase.auth.getUser();

  if (userError || !originalUser?.email || !originalUser.email_confirmed_at) {
    return { error: "A signed-in account with a verified email is required." };
  }

  const { data: factors, error: factorError } =
    await supabase.auth.mfa.listFactors();

  if (factorError) {
    return { error: factorError.message };
  }

  const verifiedFactors = factors.totp.filter(
    (factor) => factor.status === "verified",
  );

  if (verifiedFactors.length === 0) {
    return { error: "No verified authenticator is available to recover." };
  }

  const { data: verified, error: verifyError } =
    await supabase.auth.verifyOtp({
      email: originalUser.email,
      token: code,
      type: "email",
    });

  if (
    verifyError ||
    verified.user?.id !== originalUser.id ||
    verified.user.email?.toLowerCase() !== originalUser.email.toLowerCase()
  ) {
    if (verified.user && verified.user.id !== originalUser.id) {
      await supabase.auth.signOut({ scope: "local" });
    }
    return { error: "Invalid or expired email verification code." };
  }

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  for (const factor of verifiedFactors) {
    const { error } = await admin.auth.admin.mfa.deleteFactor({
      id: factor.id,
      userId: originalUser.id,
    });

    if (error) {
      return {
        error: "Email verified, but the authenticator could not be removed. Try recovery again.",
      };
    }
  }

  const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
  if (signOutError) {
    return {
      error: "The authenticator was removed. Please sign in again to continue.",
    };
  }

  return { success: true };
}