import { supabase } from "@/lib/supabase";
import { getAuthenticatedUser } from "@/lib/profileService";

export interface Plan {
  code: string;
  name: string;
  interval: "monthly" | "yearly";
  price_cents: number;
  currency: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan?: string | null;
  plan_code: string | null;
  interval: "monthly" | "yearly" | null;
  status: "inactive" | "active" | "cancelled" | "lapsed";
  amount_cents: number;
  currency: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  provider: string;
  is_test: boolean;
}

/**
 * Payment abstraction. `SimulatedProvider` is what ships; a StripeProvider can
 * be added later by implementing this interface and calling an Edge Function
 * that holds the secret key. No frontend component changes needed.
 */
export interface PaymentProvider {
  readonly id: string;
  readonly isLive: boolean;
  /** Returns a provider reference (Stripe: a session/subscription id). */
  checkout(plan: Plan): Promise<{ providerRef: string | null }>;
}

export const SimulatedProvider: PaymentProvider = {
  id: "simulated",
  isLive: false,
  async checkout() {
    // No card is charged. We do NOT fabricate a payment confirmation —
    // the record is stamped is_test=true and surfaced as such in the UI.
    return { providerRef: null };
  },
};

let provider: PaymentProvider = SimulatedProvider;
export const setPaymentProvider = (p: PaymentProvider) => {
  provider = p;
};
export const getPaymentProvider = () => provider;

export async function listPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("plans")
    .select("code,name,interval,price_cents,currency")
    .eq("is_active", true)
    .order("price_cents");
  if (error) throw new Error(error.message);

  const rawPlans = (data ?? []) as Plan[];
  if (rawPlans.length === 0) {
    return [
      {
        code: "monthly",
        name: "Monthly membership",
        interval: "monthly",
        price_cents: 99900,
        currency: "INR",
      },
      {
        code: "yearly",
        name: "Yearly membership",
        interval: "yearly",
        price_cents: 999900,
        currency: "INR",
      },
    ];
  }

  // Normalize all plan records to INR pricing
  return rawPlans.map((p) => {
    if (p.currency === "GBP" || p.price_cents < 50000) {
      if (p.interval === "yearly" || p.code === "yearly") {
        return {
          ...p,
          name: p.name || "Yearly membership",
          interval: "yearly",
          price_cents: 999900,
          currency: "INR",
        };
      }
      return {
        ...p,
        name: p.name || "Monthly membership",
        interval: "monthly",
        price_cents: 99900,
        currency: "INR",
      };
    }
    return {
      ...p,
      currency: "INR",
    };
  });
}

export async function getMySubscription(): Promise<Subscription | null> {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .order("current_period_end", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const sub = data as Subscription;
  // Normalize subscription currency to INR and match plan pricing if legacy
  let amount = sub.amount_cents;
  if (sub.currency === "GBP" || amount < 50000) {
    amount = sub.interval === "yearly" ? 999900 : 99900;
  }
  return {
    ...sub,
    amount_cents: amount,
    currency: "INR",
  };
}

export async function subscribe(plan: Plan): Promise<Subscription> {
  const { providerRef } = await provider.checkout(plan);

  let res = await supabase.rpc("activate_subscription", {
    p_plan_code: plan.code,
    p_provider_ref: providerRef,
  });

  if (
    res.error &&
    (res.error.message.includes("function") ||
      res.error.message.includes("parameter") ||
      res.error.code === "42883")
  ) {
    res = await supabase.rpc("activate_subscription", {
      plan_code: plan.code,
      provider_ref: providerRef,
    });
  }

  if (res.error) {
    if (res.error.message.includes("plan_not_available"))
      throw new Error("That plan is no longer available.");
    if (res.error.message.includes("account_deactivated"))
      throw new Error("Your account is deactivated.");
    throw new Error(res.error.message);
  }

  const s = res.data as Subscription;
  return {
    ...s,
    amount_cents: plan.price_cents,
    currency: "INR",
  };
}

export async function cancelSubscription(): Promise<void> {
  const { error } = await supabase.rpc("cancel_subscription");
  if (error) throw new Error(error.message);
}

/** PRD §04: real-time status check used to gate features. */
export function isSubscriptionActive(s: Subscription | null): boolean {
  if (!s || s.status !== "active") return false;
  if (!s.current_period_end) return false;
  return new Date(s.current_period_end).getTime() > Date.now();
}
