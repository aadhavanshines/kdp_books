import { Column, Row, Section, Text } from "@react-email/components";
import { EMAIL_NEUTRALS as N } from "../theme";
import { textFooter, toEmail, type EmailContent } from "./content";
import { EmailLayout, mutedStyle, textStyle } from "./layout";

export interface ReceiptEmailProps {
  product: string;
  workspaceName: string;
  invoiceNumber: string;
  planName: string;
  interval: "month" | "year";
  /** Pre-formatted, e.g. "5 Nov 2026 – 4 Dec 2026". */
  periodLabel: string;
  /** Pre-formatted lines, e.g. [{ label: "Pro plan (monthly)", amount: "₹499.00" }, { label: "IGST 18%", amount: "₹89.82" }]. */
  lines: { label: string; amount: string }[];
  total: string;
  billingUrl: string;
}

export type PlanChangeKind = "upgraded" | "downgrade_scheduled" | "cancel_scheduled" | "resumed" | "downgraded" | "payment_failed";

export interface PlanChangeEmailProps {
  product: string;
  workspaceName: string;
  kind: PlanChangeKind;
  /** The plan after the change (or the plan at risk, for payment_failed). */
  planName: string;
  /** The previous plan, where it helps ("from Pro to Business"). */
  previousPlanName?: string;
  /** Pre-formatted date, e.g. when a scheduled change happens or the grace period ends. */
  effectiveDate?: string;
  billingUrl: string;
}

const cell = { fontSize: "14px", lineHeight: "20px", color: N.text, padding: "10px 0", borderBottom: `1px solid ${N.border}` } as const;

export function receiptTemplate(p: ReceiptEmailProps): Promise<EmailContent> {
  const billed = p.interval === "year" ? "yearly" : "monthly";
  return toEmail(
    `Receipt ${p.invoiceNumber} for ${p.workspaceName}`,
    <EmailLayout product={p.product} preview={`We received ${p.total} for ${p.workspaceName}. Thank you.`} heading="Thanks for your payment" action={{ label: "View invoices", url: p.billingUrl }} note="Download the GST invoice from the billing page at any time.">
      <Text style={textStyle}>
        We received your payment for the <strong>{p.planName}</strong> plan ({billed}) for {p.workspaceName}.
      </Text>
      <Section style={{ margin: "0 0 20px" }}>
        <Row>
          <Column style={{ ...mutedStyle, paddingBottom: "6px" }}>Invoice {p.invoiceNumber}</Column>
          <Column style={{ ...mutedStyle, paddingBottom: "6px", textAlign: "right" }}>{p.periodLabel}</Column>
        </Row>
        {p.lines.map((l, i) => (
          <Row key={i}>
            <Column style={cell}>{l.label}</Column>
            <Column style={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>{l.amount}</Column>
          </Row>
        ))}
        <Row>
          <Column style={{ ...cell, borderBottom: "none", fontWeight: 600 }}>Total paid</Column>
          <Column style={{ ...cell, borderBottom: "none", fontWeight: 600, textAlign: "right", whiteSpace: "nowrap" }}>{p.total}</Column>
        </Row>
      </Section>
    </EmailLayout>,
    `Thanks for your payment.\n\nReceipt ${p.invoiceNumber} for ${p.workspaceName}\n${p.planName} plan (${billed}), ${p.periodLabel}\n\n${p.lines.map((l) => `${l.label}: ${l.amount}`).join("\n")}\nTotal paid: ${p.total}\n\nView invoices:\n${p.billingUrl}${textFooter(p.product)}`,
  );
}

function planChangeCopy(p: PlanChangeEmailProps): { subject: string; heading: string; body: string; action: string } {
  const on = p.effectiveDate ? ` on ${p.effectiveDate}` : " at the end of the billing period";
  switch (p.kind) {
    case "upgraded":
      return { subject: `${p.workspaceName} is now on ${p.planName}`, heading: `Welcome to ${p.planName}`, body: `${p.workspaceName} moved ${p.previousPlanName ? `from ${p.previousPlanName} ` : ""}to the ${p.planName} plan. The new limits and features are ready to use now.`, action: "See your plan" };
    case "downgrade_scheduled":
      return { subject: `${p.workspaceName} will move to ${p.planName}${on}`, heading: "Your plan change is scheduled", body: `${p.workspaceName} keeps ${p.previousPlanName ?? "its current plan"} until the period you've paid for ends, then moves to ${p.planName}${on}. You can change your mind before then.`, action: "Review the change" };
    case "cancel_scheduled":
      return { subject: `${p.workspaceName}'s ${p.planName} plan ends${on}`, heading: "Your subscription is cancelled", body: `You won't be charged again. ${p.workspaceName} keeps ${p.planName}${on}, then moves to the Free plan. Your data stays.`, action: "Keep my plan" };
    case "resumed":
      return { subject: `${p.workspaceName} stays on ${p.planName}`, heading: "Your subscription continues", body: `The scheduled change was undone. ${p.workspaceName} stays on ${p.planName} and renews as usual.`, action: "Open billing" };
    case "downgraded":
      return { subject: `${p.workspaceName} is now on the ${p.planName} plan`, heading: `You're now on ${p.planName}`, body: `${p.workspaceName} moved ${p.previousPlanName ? `from ${p.previousPlanName} ` : ""}to ${p.planName}. Everything you created is still there; some features and limits have changed. Upgrade any time to get them back.`, action: "Compare plans" };
    case "payment_failed":
      return { subject: `Action needed: payment failed for ${p.workspaceName}`, heading: "We couldn't take your payment", body: `The renewal payment for ${p.workspaceName}'s ${p.planName} plan didn't go through. We'll retry automatically. Please check your payment method${p.effectiveDate ? `: if it still fails by ${p.effectiveDate}, the workspace moves to the Free plan` : ""}.`, action: "Update payment" };
  }
}

export function planChangeTemplate(p: PlanChangeEmailProps): Promise<EmailContent> {
  const c = planChangeCopy(p);
  return toEmail(
    c.subject,
    <EmailLayout product={p.product} preview={c.body} heading={c.heading} action={{ label: c.action, url: p.billingUrl }} note="Only the workspace owner can change billing.">
      <Text style={textStyle}>{c.body}</Text>
    </EmailLayout>,
    `${c.heading}\n\n${c.body}\n\n${c.action}:\n${p.billingUrl}${textFooter(p.product)}`,
  );
}
