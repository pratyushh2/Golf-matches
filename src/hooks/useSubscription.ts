import { useAsync } from "@/hooks/useAsync";
import {
  getMySubscription,
  isSubscriptionActive,
  listPlans,
  type Plan,
  type Subscription,
} from "@/lib/subscriptionService";

export function useSubscription() {
  const { data, loading, error, refetch } = useAsync<Subscription | null>(
    () => getMySubscription(),
    [],
  );
  return { subscription: data, isActive: isSubscriptionActive(data), loading, error, refetch };
}

export const usePlans = () => useAsync<Plan[]>(() => listPlans(), []);
