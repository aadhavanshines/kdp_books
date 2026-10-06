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
  // Callable clients send a missing optional field as null, so both mean "no coupon".
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/)
    .nullish()
    .transform((v) => v ?? undefined),
});

export type CartInput = z.infer<typeof cartInputSchema>;

export const couponCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9]{3,20}$/, 'Coupon codes are 3–20 letters or digits');

const idSchema = z.string().min(1).max(128);

/** Body of a quote request (cart + delivery address). */
export const quoteRequestSchema = cartInputSchema.extend({ addressId: idSchema });

/** Body of a place-order request: a quote request plus a key that makes retries safe. */
export const placeOrderRequestSchema = quoteRequestSchema.extend({
  idempotencyKey: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
  note: z
    .string()
    .trim()
    .max(200)
    .nullish()
    .transform((v) => v ?? undefined),
});

/** What a browser sends (before validation). */
export type PlaceOrderRequest = z.input<typeof placeOrderRequestSchema>;

export const fakePayRequestSchema = z.object({
  orderId: idSchema,
  outcome: z.enum(['success', 'failure']),
});

export type FakePayRequest = z.input<typeof fakePayRequestSchema>;

/** Asks for the payment details of one of the customer's orders that still needs paying. */
export const startPaymentRequestSchema = z.object({ orderId: idSchema });

export type StartPaymentRequest = z.input<typeof startPaymentRequestSchema>;

/**
 * Razorpay Checkout's success handler output, plus our order id. The server
 * checks the signature against the Razorpay order id it stored itself, never
 * against the one in this request.
 */
export const confirmRazorpayRequestSchema = z.object({
  orderId: idSchema,
  razorpay_order_id: z.string().regex(/^order_[A-Za-z0-9]{1,40}$/),
  razorpay_payment_id: z.string().regex(/^pay_[A-Za-z0-9]{1,40}$/),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/),
});

export type ConfirmRazorpayRequest = z.input<typeof confirmRazorpayRequestSchema>;
