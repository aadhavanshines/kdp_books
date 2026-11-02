import { describe, expect, it } from 'vitest';

import { redactTokens } from './redact';

describe('redactTokens', () => {
  it('hides ?token= and &token= values in log lines', () => {
    expect(redactTokens('--> GET /orders/ord_1/stream?token=eyJhbGci.abc.def 200 12ms')).toBe(
      '--> GET /orders/ord_1/stream?token=[redacted] 200 12ms',
    );
    expect(redactTokens('GET /x?a=1&token=secret&b=2')).toBe('GET /x?a=1&token=[redacted]&b=2');
  });
  it('leaves other lines alone', () => {
    expect(redactTokens('<-- GET /cart/platter')).toBe('<-- GET /cart/platter');
  });
});
