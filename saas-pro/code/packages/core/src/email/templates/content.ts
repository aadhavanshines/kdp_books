import { render } from "@react-email/components";
import type { ReactElement } from "react";

export interface EmailContent {
  subject: string;
  html: string;
  text: string;
}

export function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Render a React Email element to HTML. The plain-text part is written by
 * hand for each template so links stay on their own line (and `firstLink`
 * finds them exactly). React escapes every interpolated value.
 */
export async function toEmail(subject: string, element: ReactElement, text: string): Promise<EmailContent> {
  return { subject, html: await render(element), text: `${text.trim()}\n` };
}

export const textFooter = (product: string) => `\n\n--\n${product} is a fictional product built for Vibe Coding a SaaS.`;
