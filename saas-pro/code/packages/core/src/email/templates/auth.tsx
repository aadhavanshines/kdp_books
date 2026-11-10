import { Text } from "@react-email/components";
import { EmailLayout, textStyle } from "./layout";
import { textFooter, toEmail, type EmailContent } from "./content";

export function verifyEmailTemplate(p: { product: string; name: string; url: string }): Promise<EmailContent> {
  const hi = p.name ? `Hi ${p.name},` : "Hi,";
  return toEmail(
    `Verify your email for ${p.product}`,
    <EmailLayout product={p.product} preview={`Confirm your email to finish setting up ${p.product}.`} heading="Confirm your email address" action={{ label: "Verify email", url: p.url }} note="The link expires in 1 hour. If you didn't sign up, you can ignore this email.">
      <Text style={textStyle}>{hi} confirm your email to finish setting up your {p.product} account.</Text>
    </EmailLayout>,
    `${hi}\n\nConfirm your email for ${p.product}:\n${p.url}\n\nThe link expires in 1 hour. If you didn't sign up, ignore this email.${textFooter(p.product)}`,
  );
}

export function magicLinkTemplate(p: { product: string; url: string }): Promise<EmailContent> {
  return toEmail(
    `Your ${p.product} sign-in link`,
    <EmailLayout product={p.product} preview="Your one-click sign-in link (expires in 5 minutes)." heading="Sign in with one click" action={{ label: `Sign in to ${p.product}`, url: p.url }} note="If you didn't ask for this, you can ignore it. Nobody can sign in without this link.">
      <Text style={textStyle}>Use this button to sign in. It works once and expires in 5 minutes.</Text>
    </EmailLayout>,
    `Sign in to ${p.product}:\n${p.url}\n\nThe link expires in 5 minutes and works once.${textFooter(p.product)}`,
  );
}

export function resetPasswordTemplate(p: { product: string; name: string; url: string }): Promise<EmailContent> {
  const hi = p.name ? `Hi ${p.name},` : "Hi,";
  return toEmail(
    `Reset your ${p.product} password`,
    <EmailLayout product={p.product} preview="Choose a new password (link expires in 1 hour)." heading="Reset your password" action={{ label: "Choose a new password", url: p.url }} note="If it wasn't you, ignore this email; your password stays the same.">
      <Text style={textStyle}>{hi} someone asked to reset your {p.product} password. The link expires in 1 hour, and you&apos;ll be signed out on your other devices.</Text>
    </EmailLayout>,
    `${hi}\n\nReset your ${p.product} password (expires in 1 hour):\n${p.url}\n\nIf it wasn't you, ignore this email.${textFooter(p.product)}`,
  );
}

export function inviteTemplate(p: { product: string; inviterName: string; workspaceName: string; role: string; url: string }): Promise<EmailContent> {
  const as = p.role === "admin" ? "an admin" : "a member";
  return toEmail(
    `${p.inviterName} invited you to ${p.workspaceName} on ${p.product}`,
    <EmailLayout product={p.product} preview={`Join ${p.workspaceName} on ${p.product}.`} heading={`Join ${p.workspaceName}`} action={{ label: "Accept invitation", url: p.url }} note="The invitation expires in 7 days. If you weren't expecting it, you can ignore it.">
      <Text style={textStyle}>
        {p.inviterName} invited you to join <strong>{p.workspaceName}</strong> on {p.product} as {as}.
      </Text>
    </EmailLayout>,
    `${p.inviterName} invited you to join ${p.workspaceName} on ${p.product} as ${as}.\n\nAccept (expires in 7 days):\n${p.url}${textFooter(p.product)}`,
  );
}
