import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";

/**
 * UI-level convenience only. Real enforcement is RLS + SECURITY DEFINER RPCs:
 * a non-admin who bypasses this gets an empty page and `not_authorized` errors.
 */
export function useAdminGuard() {
  const { status, profile, errorCode } = useProfile();
  const navigate = useNavigate();
  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (status === "error" && errorCode === "UNAUTHENTICATED") void navigate({ to: "/login" });
    if (status === "ready" && !isAdmin) void navigate({ to: "/dashboard" });
  }, [status, errorCode, isAdmin, navigate]);

  return { loading: status === "loading", isAdmin, profile };
}
