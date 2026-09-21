import { useAsync } from "@/hooks/useAsync";
import { getSettings, listCharities, type AppSettings, type Charity } from "@/lib/charityService";

export const useCharities = (includeInactive = false) =>
  useAsync<Charity[]>(() => listCharities(includeInactive), [includeInactive]);

export const useSettings = () => useAsync<AppSettings>(() => getSettings(), []);
