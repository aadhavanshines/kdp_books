import { zValidator } from '@hono/zod-validator';
import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';

import { HttpError } from './errors';

/** zValidator that answers 400 { error: { code: 'VALIDATION', ... } } on bad input. */
export function validate<Target extends keyof ValidationTargets, Schema extends ZodType>(target: Target, schema: Schema) {
  return zValidator(target, schema, (result) => {
    if (!result.success) {
      const issues = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
      const first = issues[0];
      throw new HttpError(400, 'VALIDATION', first ? `${first.path || 'input'}: ${first.message}` : 'Invalid input', issues);
    }
  });
}
