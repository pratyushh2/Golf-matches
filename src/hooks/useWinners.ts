import { useAsync } from "@/hooks/useAsync";
import { listAllWinners, listMyWinnings, type WinnerRecord } from "@/lib/winnerService";

export const useMyWinnings = () => useAsync<WinnerRecord[]>(() => listMyWinnings(), []);
export const useAllWinners = () => useAsync<WinnerRecord[]>(() => listAllWinners(), []);
