/**
 * Minimal transactional email templates. They return subject, HTML and text.
 * (React Email components replace these next session; the call sites stay.)
 */
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

function layout(product: string, heading: string, body: string, action: { label: string; url: string }, footer: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;color:#18181b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:12px;padding:32px">
<tr><td style="font-size:14px;font-weight:600;color:#52525b;padding-bottom:16px">${escapeHtml(product)}</td></tr>
<tr><td style="font-size:20px;font-weight:600;padding-bottom:12px">${escapeHtml(heading)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;padding-bottom:24px">${body}</td></tr>
<tr><td><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;font-weight:600;padding:10px 18px;border-radius:8px">${escapeHtml(action.label)}</a></td></tr>
<tr><td style="font-size:13px;line-height:1.5;color:#71717a;padding-top:24px">${footer}<br>Or paste this link into your browser:<br><span style="word-break:break-all">${escapeHtml(action.url)}</span></td></tr>
</table></td></tr></table></body></html>`;
}

export function verifyEmailTemplate(p: { product: string; name: string; url: string }): EmailContent {
  return {
    subject: `Verify your email for ${p.product}`,
    html: layout(p.product, "Confirm your email address", `Hi ${escapeHtml(p.name)}, confirm your email to finish setting up your account.`, { label: "Verify email", url: p.url }, "If you didn't sign up, you can ignore this email."),
    text: `Hi ${p.name},\n\nConfirm your email for ${p.product}:\n${p.url}\n\nIf you didn't sign up, ignore this email.`,
  };
}

export function magicLinkTemplate(p: { product: string; url: string }): EmailContent {
  return {
    subject: `Your ${p.product} sign-in link`,
    html: layout(p.product, "Sign in with one click", "Use this link to sign in. It expires in 5 minutes and works once.", { label: "Sign in", url: p.url }, "If you didn't ask for this, you can ignore it."),
    text: `Sign in to ${p.product}:\n${p.url}\n\nThe link expires in 5 minutes and works once.`,
  };
}

export function resetPasswordTemplate(p: { product: string; name: string; url: string }): EmailContent {
  return {
    subject: `Reset your ${p.product} password`,
    html: layout(p.product, "Reset your password", `Hi ${escapeHtml(p.name)}, someone asked to reset your password. The link expires in 1 hour.`, { label: "Choose a new password", url: p.url }, "If it wasn't you, ignore this email; your password stays the same."),
    text: `Hi ${p.name},\n\nReset your ${p.product} password (expires in 1 hour):\n${p.url}`,
  };
}

export function inviteTemplate(p: { product: string; inviterName: string; workspaceName: string; role: string; url: string }): EmailContent {
  return {
    subject: `${p.inviterName} invited you to ${p.workspaceName} on ${p.product}`,
    html: layout(p.product, `Join ${p.workspaceName}`, `${escapeHtml(p.inviterName)} invited you to join <strong>${escapeHtml(p.workspaceName)}</strong> as ${p.role === "admin" ? "an admin" : "a member"}. The invitation expires in 7 days.`, { label: "Accept invitation", url: p.url }, "If you weren't expecting this, you can ignore it."),
    text: `${p.inviterName} invited you to join ${p.workspaceName} on ${p.product} as ${p.role}.\n\nAccept (expires in 7 days):\n${p.url}`,
  };
}
