import { logout } from "@/actions/auth";
import { resources } from "@/config/resources";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutClient resources={resources} logoutAction={logout}>
      {children}
    </AdminLayoutClient>
  );
}