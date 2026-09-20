export type FeatureAccess = "standard" | "premium";

export interface User {
  id: string;
  displayName: string | null;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: "inactive" | "active" | "past_due" | "cancelled";
  currentPeriodEndsAt: string | null;
}

export interface Score {
  id: string;
  userId: string;
  playedAt: string;
  value: number;
  status: "pending" | "eligible" | "ineligible";
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
}

export interface Draw {
  id: string;
  status: "upcoming" | "open" | "closed";
  opensAt: string | null;
  closesAt: string | null;
}

export interface Winner {
  id: string;
  drawId: string;
  userId: string;
  status: "pending_verification" | "verified" | "ineligible";
}

export interface ProductFeature {
  id: string;
  title: string;
  category: string;
  description: string;
  access: FeatureAccess;
  href: string;
}