export type BalanceCategory = "reward" | "deposit";

export type BalanceConfig = {
  id: string;
  label: string;
  region: string;
  category: BalanceCategory;
  tokenAddress: string;
  walletAddress: string;
  tokenSymbol: string;
  tokenDecimals: number;
  explorerUrl: string;
};

export const BALANCE_CONFIGS: BalanceConfig[] = [
  {
    id: "reward-europe",
    label: "Reward Europe",
    region: "Europe",
    category: "reward",
    tokenAddress: "0xceba9300f2b948710d2653dd7b07f33a8b32118c",
    walletAddress: "0x65cc602e616ca786bdb4bab00a6272060f0082fb",
    tokenSymbol: "USDC",
    tokenDecimals: 6,
    explorerUrl:
      "https://celoscan.io/token/0xceba9300f2b948710d2653dd7b07f33a8b32118c?a=0x65cc602e616ca786bdb4bab00a6272060f0082fb",
  },
  {
    id: "deposit-usdt",
    label: "Deposit USDT",
    region: "Global",
    category: "deposit",
    tokenAddress: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e",
    walletAddress: "0xCb205D7ca9840393f43941dDEAc6a7bF8deD4c5a",
    tokenSymbol: "USDT",
    tokenDecimals: 6,
    explorerUrl:
      "https://celoscan.io/token/0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e?a=0xCb205D7ca9840393f43941dDEAc6a7bF8deD4c5a",
  },
  {
    id: "deposit-usdc",
    label: "Deposit USDC",
    region: "Global",
    category: "deposit",
    tokenAddress: "0xceba9300f2b948710d2653dd7b07f33a8b32118c",
    walletAddress: "0xCb205D7ca9840393f43941dDEAc6a7bF8deD4c5a",
    tokenSymbol: "USDC",
    tokenDecimals: 6,
    explorerUrl:
      "https://celoscan.io/token/0xceba9300f2b948710d2653dd7b07f33a8b32118c?a=0xCb205D7ca9840393f43941dDEAc6a7bF8deD4c5a",
  },
];
