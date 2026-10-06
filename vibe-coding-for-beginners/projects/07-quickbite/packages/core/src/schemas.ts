import { z } from 'zod';
import { MAX_QTY_PER_ITEM } from './pricing';

/**
 * What the browser is allowed to send when asking for a quote or placing an order.
 * Note there is no price anywhere: the server looks prices up itself.
 */
export const cartInputSchema = z.object({
  restaurantId: z.string().min(1).max(64),
  items: z
    .array(
      z.object({
        itemId: z.string().min(1).max(64),
        qty: z.number().int().min(1).max(MAX_QTY_PER_ITEM),
      }),
    )
    .min(1)
    .max(50),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/)
    .optional(),
});

export type CartInput = z.infer<typeof cartInputSchema>;

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{3,20}$/, 'Coupon codes are 3–20 letters or digits');
