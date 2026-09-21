import { useAsync } from "@/hooks/useAsync";
import {
  listAllDraws,
  listMyEntries,
  listPublishedDraws,
  type Draw,
  type DrawEntry,
} from "@/lib/drawService";

export const usePublishedDraws = () => useAsync<Draw[]>(() => listPublishedDraws(), []);
export const useAllDraws = () => useAsync<Draw[]>(() => listAllDraws(), []);
export const useMyEntries = () => useAsync<DrawEntry[]>(() => listMyEntries(), []);
