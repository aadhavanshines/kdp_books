"use client";

/** Last-resort error page (the root layout itself failed), so no theme CSS. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-IN">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100dvh", margin: 0 }}>
        <div style={{ textAlign: "center", padding: 16 }}>
          <h1 style={{ fontSize: 22 }}>Billora is having trouble</h1>
          <p>Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ padding: "8px 16px" }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
