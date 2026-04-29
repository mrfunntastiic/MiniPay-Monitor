import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getCeloBlockNumber,
  getTokenBalance,
  formatUnits,
} from "@/lib/celo";
import { BALANCE_CONFIGS, type BalanceConfig } from "@/lib/balances";

export type BalanceResult = {
  config: BalanceConfig;
  raw: bigint;
  formatted: string;
  numeric: number;
};

const REFRESH_INTERVAL_MS = 30_000;

export function useBalance(config: BalanceConfig) {
  return useQuery<BalanceResult>({
    queryKey: ["balance", config.id],
    queryFn: async () => {
      const raw = await getTokenBalance(config.tokenAddress, config.walletAddress);
      const formatted = formatUnits(raw, config.tokenDecimals);
      return {
        config,
        raw,
        formatted,
        numeric: Number(formatted),
      };
    },
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: 10_000,
  });
}

export function useAllBalances() {
  return useQueries({
    queries: BALANCE_CONFIGS.map((config) => ({
      queryKey: ["balance", config.id],
      queryFn: async (): Promise<BalanceResult> => {
        const raw = await getTokenBalance(
          config.tokenAddress,
          config.walletAddress,
        );
        const formatted = formatUnits(raw, config.tokenDecimals);
        return {
          config,
          raw,
          formatted,
          numeric: Number(formatted),
        };
      },
      refetchInterval: REFRESH_INTERVAL_MS,
      staleTime: 10_000,
    })),
  });
}

export function useBlockNumber() {
  return useQuery({
    queryKey: ["celo-block"],
    queryFn: getCeloBlockNumber,
    refetchInterval: REFRESH_INTERVAL_MS,
  });
}
