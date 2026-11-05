import { accounts } from "@saas/core/schema";
import { Button, Card, CardHeader } from "@saas/ui";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { db, requireWorkspace } from "@/lib/auth";
import { signOutEverywhereAction } from "./actions";
import { PasswordForm, ProfileForm } from "./profile-forms";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const ctx = await requireWorkspace();
  const [credential] = await db.select({ id: accounts.id }).from(accounts).where(and(eq(accounts.userId, ctx.user.id), eq(accounts.providerId, "credential")));
  return (
    <>
      <ProfileForm name={ctx.user.name} email={ctx.user.email} />
      <PasswordForm hasPassword={Boolean(credential)} />
      <Card>
        <CardHeader
          title="Sessions"
          description="Signed in on a shared or lost device? Sign out of Billora everywhere, including here."
          action={<form action={signOutEverywhereAction}><Button type="submit" variant="secondary">Sign out everywhere</Button></form>}
        />
      </Card>
    </>
  );
}
