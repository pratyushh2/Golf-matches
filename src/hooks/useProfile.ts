import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  getCurrentProfile,
  isProfileError,
  type Profile,
  type ProfileErrorCode,
} from "@/lib/profileService";

export type ProfileStatus = "loading" | "ready" | "error";

export interface UseProfileResult {
  status: ProfileStatus;
  user: User | null;
  profile: Profile | null;
  errorCode: ProfileErrorCode | null;
  errorMessage: string | null;
  refetch: () => void;
}

export function useProfile(): UseProfileResult {
  const [status, setStatus] = useState<ProfileStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [errorCode, setErrorCode] = useState<ProfileErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [token, setToken] = useState(0);
  const mounted = useRef(true);

  const refetch = useCallback(() => setToken((t) => t + 1), []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStatus("loading");
      setErrorCode(null);
      setErrorMessage(null);
      try {
        const r = await getCurrentProfile();
        if (cancelled || !mounted.current) return;
        setUser(r.user);
        setProfile(r.profile);
        setStatus("ready");
      } catch (e) {
        if (cancelled || !mounted.current) return;
        setProfile(null);
        if (isProfileError(e)) {
          setErrorCode(e.code);
          setErrorMessage(e.message);
        } else {
          setErrorCode("QUERY_FAILED");
          setErrorMessage("Could not load your profile.");
        }
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN" || e === "SIGNED_OUT" || e === "USER_UPDATED") refetch();
    });
    return () => data.subscription.unsubscribe();
  }, [refetch]);

  return { status, user, profile, errorCode, errorMessage, refetch };
}
