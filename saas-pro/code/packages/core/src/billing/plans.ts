/**
 * Plans for every product (PRD §1–4). Prices are integer paise and exclude
 * GST; Indian workspaces pay 18% GST on top (see billing/tax.ts). Yearly
 * prices are ten months' worth: two months free.
 *
 * Limits are typed per product: `limits` are numbers (null = unlimited),
 * `features` are on/off. A limit's `period` says whether it resets monthly
 * (metered usage) or counts what exists now (members, forms, staff).
 */

export const PRODUCTS = ["billora", "slotra", "wordloom", "formora"] as const;
export type Product = (typeof PRODUCTS)[number];

export const PLAN_IDS = ["free", "pro", "business"] as const;
export type PlanId = (typeof PLAN_IDS)[number];
export type BillingInterval = "month" | "year";

export interface LimitInfo {
  label: string;
  /** Singular and plural nouns for "3 of 5 invoices". */
  unit: [string, string];
  period: "month" | "total";
}

interface ProductCatalog<L extends string, F extends string> {
  product: Product;
  name: string;
  limitInfo: Record<L, LimitInfo>;
  featureLabels: Record<F, string>;
  /** The limit shown in the sidebar meter. */
  primaryLimit: L;
  plans: Record<PlanId, PlanDefinition<L, F>>;
}

export interface PlanDefinition<L extends string = string, F extends string = string> {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPaise: number;
  yearlyPaise: number;
  limits: Record<L, number | null>;
  features: Record<F, boolean>;
  /** Short selling points for the pricing table, in order. */
  highlights: string[];
  recommended?: boolean;
}

const yearly = (monthly: number) => monthly * 10;

const billora = {
  product: "billora",
  name: "Billora",
  primaryLimit: "invoicesPerMonth",
  limitInfo: {
    invoicesPerMonth: { label: "Invoices this month", unit: ["invoice", "invoices"], period: "month" },
    members: { label: "Team members", unit: ["member", "members"], period: "total" },
  },
  featureLabels: { reminders: "Automatic payment reminders", recurring: "Recurring invoices", reports: "GST reports and CSV export", customBranding: "Your logo and colours on invoices" },
  plans: {
    free: {
      id: "free", name: "Free", tagline: "For your first few clients.", monthlyPaise: 0, yearlyPaise: 0,
      limits: { invoicesPerMonth: 5, members: 1 },
      features: { reminders: false, recurring: false, reports: false, customBranding: false },
      highlights: ["5 invoices a month", "GST-ready invoices and PDFs", "Online payments", "1 team member"],
    },
    pro: {
      id: "pro", name: "Pro", tagline: "For busy freelancers.", monthlyPaise: 499_00, yearlyPaise: yearly(499_00), recommended: true,
      limits: { invoicesPerMonth: null, members: 1 },
      features: { reminders: true, recurring: true, reports: false, customBranding: false },
      highlights: ["Unlimited invoices", "Automatic reminders", "Recurring invoices", "Everything in Free"],
    },
    business: {
      id: "business", name: "Business", tagline: "For small teams.", monthlyPaise: 1_499_00, yearlyPaise: yearly(1_499_00),
      limits: { invoicesPerMonth: null, members: 5 },
      features: { reminders: true, recurring: true, reports: true, customBranding: true },
      highlights: ["5 team members", "GST reports and CSV export", "Custom branding", "Everything in Pro"],
    },
  },
} as const satisfies ProductCatalog<"invoicesPerMonth" | "members", "reminders" | "recurring" | "reports" | "customBranding">;

const slotra = {
  product: "slotra",
  name: "Slotra",
  primaryLimit: "bookingsPerMonth",
  limitInfo: {
    bookingsPerMonth: { label: "Bookings this month", unit: ["booking", "bookings"], period: "month" },
    staff: { label: "Staff", unit: ["staff member", "staff members"], period: "total" },
    members: { label: "Team members", unit: ["member", "members"], period: "total" },
  },
  featureLabels: { deposits: "Deposits at booking", reminders: "Email reminders", customBranding: "Custom booking page branding" },
  plans: {
    free: {
      id: "free", name: "Free", tagline: "For a solo practice.", monthlyPaise: 0, yearlyPaise: 0,
      limits: { bookingsPerMonth: 30, staff: 1, members: 1 },
      features: { deposits: false, reminders: false, customBranding: false },
      highlights: ["30 bookings a month", "1 staff member", "Public booking page"],
    },
    pro: {
      id: "pro", name: "Pro", tagline: "For a growing studio.", monthlyPaise: 699_00, yearlyPaise: yearly(699_00), recommended: true,
      limits: { bookingsPerMonth: null, staff: 5, members: 5 },
      features: { deposits: true, reminders: true, customBranding: false },
      highlights: ["Unlimited bookings", "5 staff", "Deposits", "Reminders"],
    },
    business: {
      id: "business", name: "Business", tagline: "For clinics and salons.", monthlyPaise: 1_999_00, yearlyPaise: yearly(1_999_00),
      limits: { bookingsPerMonth: null, staff: 20, members: 20 },
      features: { deposits: true, reminders: true, customBranding: true },
      highlights: ["20 staff", "Custom booking page branding", "Everything in Pro"],
    },
  },
} as const satisfies ProductCatalog<"bookingsPerMonth" | "staff" | "members", "deposits" | "reminders" | "customBranding">;

const wordloom = {
  product: "wordloom",
  name: "Wordloom",
  primaryLimit: "wordsPerMonth",
  limitInfo: {
    wordsPerMonth: { label: "Words this month", unit: ["word", "words"], period: "month" },
    members: { label: "Team members", unit: ["member", "members"], period: "total" },
  },
  featureLabels: { brandVoice: "Brand voice", sharedBrandVoices: "Shared brand voices" },
  plans: {
    free: {
      id: "free", name: "Free", tagline: "Try it out.", monthlyPaise: 0, yearlyPaise: 0,
      limits: { wordsPerMonth: 5_000, members: 1 },
      features: { brandVoice: false, sharedBrandVoices: false },
      highlights: ["5,000 words a month", "Every template"],
    },
    pro: {
      id: "pro", name: "Pro", tagline: "For a working writer.", monthlyPaise: 799_00, yearlyPaise: yearly(799_00), recommended: true,
      limits: { wordsPerMonth: 100_000, members: 1 },
      features: { brandVoice: true, sharedBrandVoices: false },
      highlights: ["100,000 words a month", "Brand voice", "Everything in Free"],
    },
    business: {
      id: "business", name: "Business", tagline: "For marketing teams.", monthlyPaise: 2_499_00, yearlyPaise: yearly(2_499_00),
      limits: { wordsPerMonth: 500_000, members: 5 },
      features: { brandVoice: true, sharedBrandVoices: true },
      highlights: ["500,000 words a month", "5 team members", "Shared brand voices"],
    },
  },
} as const satisfies ProductCatalog<"wordsPerMonth" | "members", "brandVoice" | "sharedBrandVoices">;

const formora = {
  product: "formora",
  name: "Formora",
  primaryLimit: "responsesPerMonth",
  limitInfo: {
    forms: { label: "Forms", unit: ["form", "forms"], period: "total" },
    responsesPerMonth: { label: "Responses this month", unit: ["response", "responses"], period: "month" },
    members: { label: "Team members", unit: ["member", "members"], period: "total" },
  },
  featureLabels: { logic: "Conditional logic", webhooks: "Webhooks", customBranding: "Custom branding" },
  plans: {
    free: {
      id: "free", name: "Free", tagline: "For a quick survey.", monthlyPaise: 0, yearlyPaise: 0,
      limits: { forms: 3, responsesPerMonth: 100, members: 1 },
      features: { logic: false, webhooks: false, customBranding: false },
      highlights: ["3 forms", "100 responses a month"],
    },
    pro: {
      id: "pro", name: "Pro", tagline: "For regular collecting.", monthlyPaise: 399_00, yearlyPaise: yearly(399_00), recommended: true,
      limits: { forms: null, responsesPerMonth: 5_000, members: 1 },
      features: { logic: true, webhooks: true, customBranding: false },
      highlights: ["Unlimited forms", "5,000 responses a month", "Logic and webhooks"],
    },
    business: {
      id: "business", name: "Business", tagline: "For teams at scale.", monthlyPaise: 1_299_00, yearlyPaise: yearly(1_299_00),
      limits: { forms: null, responsesPerMonth: 50_000, members: 5 },
      features: { logic: true, webhooks: true, customBranding: true },
      highlights: ["50,000 responses a month", "5 team members", "Custom branding"],
    },
  },
} as const satisfies ProductCatalog<"forms" | "responsesPerMonth" | "members", "logic" | "webhooks" | "customBranding">;

export const CATALOG = { billora, slotra, wordloom, formora } as const;
export type Catalog = typeof CATALOG;

export type LimitKey<P extends Product> = keyof Catalog[P]["limitInfo"] & string;
export type FeatureKey<P extends Product> = keyof Catalog[P]["featureLabels"] & string;
export type ProductPlan<P extends Product> = Catalog[P]["plans"][PlanId];

export function getPlan<P extends Product>(product: P, plan: PlanId): ProductPlan<P> {
  return CATALOG[product].plans[plan] as ProductPlan<P>;
}

export function listPlans<P extends Product>(product: P): ProductPlan<P>[] {
  return PLAN_IDS.map((id) => getPlan(product, id));
}

export function planPrice(plan: { monthlyPaise: number; yearlyPaise: number }, interval: BillingInterval): number {
  return interval === "year" ? plan.yearlyPaise : plan.monthlyPaise;
}

export const PLAN_RANK: Record<PlanId, number> = { free: 0, pro: 1, business: 2 };

export function isUpgrade(from: PlanId, to: PlanId): boolean {
  return PLAN_RANK[to] > PLAN_RANK[from];
}

export function isPlanId(v: unknown): v is PlanId {
  return typeof v === "string" && (PLAN_IDS as readonly string[]).includes(v);
}

export function isProduct(v: unknown): v is Product {
  return typeof v === "string" && (PRODUCTS as readonly string[]).includes(v);
}
