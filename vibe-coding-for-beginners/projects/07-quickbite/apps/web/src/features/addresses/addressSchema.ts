import { z } from 'zod';

/** Validation for the delivery address form (Indian phone numbers and PIN codes for now). */
export const addressSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  name: z.string().trim().min(2, 'Enter the receiver’s name').max(60),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|0)/, ''))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')),
  line1: z.string().trim().min(3, 'Enter your flat / house number and building').max(120),
  line2: z.string().trim().min(3, 'Enter the street or locality').max(120),
  landmark: z.string().trim().max(80),
  areaId: z.string().min(1, 'Choose your area'),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code'),
});

export type AddressInput = z.input<typeof addressSchema>;
