import { Body, Button, Container, Head, Heading, Hr, Html, Link, Preview, Section, Text } from "@react-email/components";
import type { ReactNode } from "react";
import { EMAIL_NEUTRALS as N, emailBrand } from "../theme";

const font = "Inter, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

export const textStyle = { fontSize: "15px", lineHeight: "24px", color: N.text, margin: "0 0 16px" } as const;
export const mutedStyle = { fontSize: "13px", lineHeight: "20px", color: N.muted, margin: "0" } as const;

/** The shared frame: product mark, heading, body, call to action, fallback link, footer. */
export function EmailLayout({ product, preview, heading, children, action, note }: {
  product: string;
  preview: string;
  heading: string;
  children: ReactNode;
  action?: { label: string; url: string };
  /** Small print under the button, e.g. "If you didn't sign up, ignore this email." */
  note?: string;
}) {
  const brand = emailBrand(product);
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ margin: 0, backgroundColor: N.page, fontFamily: font, color: N.text }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "32px 16px" }}>
          <Section style={{ padding: "0 4px 20px" }}>
            <table role="presentation" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: brand.primary, color: brand.primaryForeground, fontSize: "16px", fontWeight: 700, textAlign: "center", verticalAlign: "middle", position: "relative" }}>
                    {product.charAt(0).toUpperCase()}
                  </td>
                  <td style={{ paddingLeft: "10px", fontSize: "17px", fontWeight: 600, color: N.text }}>
                    {product}
                    <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "3px", backgroundColor: brand.accent, marginLeft: "4px", verticalAlign: "top" }} />
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
          <Section style={{ backgroundColor: N.surface, border: `1px solid ${N.border}`, borderRadius: "12px", padding: "32px" }}>
            <Heading as="h1" style={{ fontSize: "20px", lineHeight: "28px", fontWeight: 600, margin: "0 0 16px", color: N.text }}>{heading}</Heading>
            {children}
            {action && (
              <>
                <Button href={action.url} style={{ display: "inline-block", backgroundColor: brand.primary, color: brand.primaryForeground, fontSize: "15px", fontWeight: 600, textDecoration: "none", padding: "11px 20px", borderRadius: "8px", marginTop: "8px" }}>
                  {action.label}
                </Button>
                <Hr style={{ borderColor: N.border, margin: "28px 0 16px" }} />
                {note && <Text style={{ ...mutedStyle, marginBottom: "8px" }}>{note}</Text>}
                <Text style={mutedStyle}>
                  Button not working? Paste this link into your browser:
                  <br />
                  <Link href={action.url} style={{ color: brand.primary, wordBreak: "break-all" }}>{action.url}</Link>
                </Text>
              </>
            )}
            {!action && note && <Text style={mutedStyle}>{note}</Text>}
          </Section>
          <Text style={{ ...mutedStyle, fontSize: "12px", textAlign: "center", padding: "20px 8px 0" }}>
            {product} is a fictional product built for Vibe Coding a SaaS. Questions? Write to support@{product.toLowerCase()}.example.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
