import { getSiteSettings } from "@/lib/queries";
import { MobileNav } from "./MobileNav";

export async function Header() {
  const settings = await getSiteSettings();
  return <MobileNav siteName={settings.name} />;
}