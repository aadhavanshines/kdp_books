import { BrandLogo } from "@saas/ui";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="px-4 pt-6 sm:px-8 sm:pt-8">
        <Link href="/" className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLogo product="Billora" />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-8 sm:items-center sm:pt-4">
        <div className="w-full max-w-[400px]">{children}</div>
      </main>
      <footer className="px-4 pb-6 text-center text-xs text-muted-foreground">
        Billora is a fictional product built for <em>Vibe Coding a SaaS</em>.
      </footer>
    </div>
  );
}
