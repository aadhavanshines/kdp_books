import { notFound } from "next/navigation";

/** Development-only mailbox. In production this whole route is a 404. */
export default function DevMailLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
