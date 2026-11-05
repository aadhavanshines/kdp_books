import { PageHeader } from "@saas/ui";
import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageHeader title="Settings" description="Manage your business, team and account." className="mb-4" />
      <SettingsTabs />
      <div className="mt-6 grid gap-6">{children}</div>
    </>
  );
}
