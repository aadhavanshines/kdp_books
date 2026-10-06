import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(60),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))
    .pipe(z.string().regex(/^([6-9]\d{9})?$/, 'Enter a valid 10-digit mobile number')),
});

export type ProfileInput = z.input<typeof profileSchema>;
