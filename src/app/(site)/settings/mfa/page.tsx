import { redirect } from "next/navigation";

export default function MfaRedirectPage() {
  redirect("/admin/mfa");
}
