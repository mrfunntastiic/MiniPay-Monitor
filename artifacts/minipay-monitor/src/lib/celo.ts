const CELO_RPC = "https://forno.celo.org";

function padAddress(address: string): string {
  return address.toLowerCase().replace(/^0x/, "").padStart(64, "0");
}

async function rpcCall(to: string, data: string): Promise<string> {
  const response = await fetch(CELO_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
  });
  if (!response.ok) {
    throw new Error(`RPC request failed: ${response.status}`);
  }
  const json = await response.json();
  if (json.error) {
    throw new Error(`RPC error: ${json.error.message ?? JSON.stringify(json.error)}`);
  }
  return json.result as string;
}

export async function getTokenBalance(
  tokenAddress: string,
  walletAddress: string,
): Promise<bigint> {
  const data = "0x70a08231" + padAddress(walletAddress);
  const result = await rpcCall(tokenAddress, data);
  return BigInt(result);
}

export async function getTokenDecimals(tokenAddress: string): Promise<number> {
  const result = await rpcCall(tokenAddress, "0x313ce567");
  return Number(BigInt(result));
}

export async function getTokenSymbol(tokenAddress: string): Promise<string> {
  const result = await rpcCall(tokenAddress, "0x95d89b41");
  return decodeString(result);
}

export async function getTokenName(tokenAddress: string): Promise<string> {
  const result = await rpcCall(tokenAddress, "0x06fdde03");
  return decodeString(result);
}

export async function getCeloBlockNumber(): Promise<number> {
  const response = await fetch(CELO_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_blockNumber",
      params: [],
    }),
  });
  const json = await response.json();
  return Number(BigInt(json.result));
}

function decodeString(hex: string): string {
  const clean = hex.replace(/^0x/, "");
  if (clean.length < 128) return "";
  const lengthHex = clean.slice(64, 128);
  const length = Number(BigInt("0x" + lengthHex));
  const dataHex = clean.slice(128, 128 + length * 2);
  let result = "";
  for (let i = 0; i < dataHex.length; i += 2) {
    const code = parseInt(dataHex.slice(i, i + 2), 16);
    if (code === 0) continue;
    result += String.fromCharCode(code);
  }
  return result;
}

export function formatUnits(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const divisor = 10n ** BigInt(decimals);
  const integer = absolute / divisor;
  const fraction = absolute % divisor;
  const fractionStr = fraction.toString().padStart(decimals, "0");
  const trimmed = fractionStr.replace(/0+$/, "");
  const result = trimmed.length > 0 ? `${integer}.${trimmed}` : integer.toString();
  return negative ? `-${result}` : result;
}
