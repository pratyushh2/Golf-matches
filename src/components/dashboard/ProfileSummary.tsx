import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProfile } from "@/hooks/useProfile";
import { Panel, PanelTitle, Loading, ErrorState, Badge } from "@/components/common/States";

export function ProfileSummary() {
  const navigate = useNavigate();
  const { status, user, profile, errorCode, errorMessage, refetch } = useProfile();

  useEffect(() => {
    if (status === "error" && errorCode === "UNAUTHENTICATED") void navigate({ to: "/login" });
  }, [status, errorCode, navigate]);

  if (status === "loading")
    return (
      <Panel>
        <Loading label="Loading your profile…" />
      </Panel>
    );
  if (status === "error" && errorCode === "UNAUTHENTICATED")
    return (
      <Panel>
        <p className="text-sm text-white/60">Redirecting to sign in…</p>
      </Panel>
    );
  if (status === "error")
    return (
      <Panel>
        <ErrorState
          message={
            errorCode === "PROFILE_NOT_FOUND"
              ? "We could not find a profile record for your account. Contact support so it can be restored."
              : (errorMessage ?? "Profile unavailable.")
          }
          onRetry={refetch}
        />
      </Panel>
    );
  if (!profile) return null;

  return (
    <Panel>
      <PanelTitle>Signed in as</PanelTitle>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-semibold text-white">{profile.displayName}</h2>
        <Badge tone={profile.role === "admin" ? "good" : "neutral"}>
          {profile.role === "admin" ? "Administrator" : "Member"}
        </Badge>
        {!profile.isActive && <Badge tone="bad">Deactivated</Badge>}
      </div>
      {(profile.email ?? user?.email) && (
        <p className="mt-2 text-sm text-white/50">{profile.email ?? user?.email}</p>
      )}
    </Panel>
  );
}

export default ProfileSummary;
