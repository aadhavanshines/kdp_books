/**
 * Hides login tokens in text that may be logged. The live order stream takes
 * its token as `?token=` (EventSource can't send headers), so request logs
 * would otherwise print it in full.
 */
export function redactTokens(text: string): string {
  return text.replace(/([?&]token=)[^&\s]+/g, '$1[redacted]');
}
