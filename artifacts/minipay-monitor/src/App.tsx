import { useEffect, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Box,
  Check,
  Coins,
  Copy,
  Gift,
  RefreshCw,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BALANCE_CONFIGS, type BalanceConfig } from "@/lib/balances";
import {
  useAllBalances,
  useBlockNumber,
  type BalanceResult,
} from "@/hooks/useBalances";
import { useCountUp, useTicker } from "@/hooks/useCountUp";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function formatMoney(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function truncateAddress(addr: string, head = 6, tail = 4): string {
  if (addr.length <= head + tail + 2) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

function timeAgo(timestamp: number, now: number): string {
  if (!timestamp) return "never";
  const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function CategoryIcon({ category }: { category: BalanceConfig["category"] }) {
  if (category === "reward") {
    return <Gift className="h-4 w-4" strokeWidth={1.6} />;
  }
  return <Wallet className="h-4 w-4" strokeWidth={1.6} />;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        });
      }}
      className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover-elevate active-elevate-2"
      aria-label={`Copy ${value}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Check className="h-3.5 w-3.5 text-primary" />
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Copy className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function AnimatedNumber({
  value,
  fractionDigits = 2,
  className,
}: {
  value: number;
  fractionDigits?: number;
  className?: string;
}) {
  const animated = useCountUp(value);
  return (
    <span className={cn("tabular-nums", className)}>
      {formatMoney(animated, fractionDigits)}
    </span>
  );
}

type BalanceCardProps = {
  config: BalanceConfig;
  query: ReturnType<typeof useAllBalances>[number];
  now: number;
  index: number;
};

function BalanceCard({ config, query, now, index }: BalanceCardProps) {
  const data = query.data as BalanceResult | undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative overflow-hidden border-card-border bg-card/60 backdrop-blur-sm">
        {/* Top accent line */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-px",
            config.category === "reward"
              ? "bg-gradient-to-r from-transparent via-primary/60 to-transparent"
              : "bg-gradient-to-r from-transparent via-accent/50 to-transparent",
          )}
        />

        <CardHeader className="space-y-3 pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border",
                  config.category === "reward"
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-accent/30 bg-accent/10 text-accent",
                )}
              >
                <CategoryIcon category={config.category} />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  {config.label}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {config.region} · Celo
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="font-mono text-[10px] uppercase tracking-wider"
            >
              {config.tokenSymbol}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Balance */}
          <div className="space-y-1">
            {query.isLoading && !data ? (
              <Skeleton className="h-10 w-44" />
            ) : query.isError ? (
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Failed to load</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <AnimatedNumber
                  value={data?.numeric ?? 0}
                  fractionDigits={2}
                  className="text-3xl font-semibold tracking-tight text-foreground"
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {config.tokenSymbol}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {query.isFetching ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-primary pulse-dot" />
                  Syncing…
                </span>
              ) : query.dataUpdatedAt ? (
                `Updated ${timeAgo(query.dataUpdatedAt, now)}`
              ) : (
                "—"
              )}
            </p>
          </div>

          <Separator />

          {/* Address rows */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Wallet
              </span>
              <div className="flex items-center gap-1">
                <code className="font-mono text-xs text-foreground">
                  {truncateAddress(config.walletAddress)}
                </code>
                <CopyButton value={config.walletAddress} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Token
              </span>
              <div className="flex items-center gap-1">
                <code className="font-mono text-xs text-foreground">
                  {truncateAddress(config.tokenAddress)}
                </code>
                <CopyButton value={config.tokenAddress} />
              </div>
            </div>
          </div>

          {/* Action */}
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-between font-medium"
          >
            <a
              href={config.explorerUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              View on Celoscan
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </Button>

          {query.isError && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => query.refetch()}
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
              Retry
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function CategorySection({
  title,
  description,
  icon,
  configs,
  queries,
  now,
  startIndex,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  configs: BalanceConfig[];
  queries: ReturnType<typeof useAllBalances>;
  now: number;
  startIndex: number;
}) {
  const subtotal = configs.reduce((sum, cfg) => {
    const idx = BALANCE_CONFIGS.findIndex((c) => c.id === cfg.id);
    const data = queries[idx]?.data as BalanceResult | undefined;
    return sum + (data?.numeric ?? 0);
  }, 0);

  const isLoading = configs.some((cfg) => {
    const idx = BALANCE_CONFIGS.findIndex((c) => c.id === cfg.id);
    return queries[idx]?.isLoading && !queries[idx]?.data;
  });

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Subtotal
          </p>
          {isLoading ? (
            <Skeleton className="ml-auto h-6 w-24" />
          ) : (
            <p className="font-mono text-lg font-semibold tracking-tight tabular-nums">
              <AnimatedNumber value={subtotal} fractionDigits={2} />
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                USD
              </span>
            </p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {configs.map((cfg, i) => {
          const idx = BALANCE_CONFIGS.findIndex((c) => c.id === cfg.id);
          return (
            <BalanceCard
              key={cfg.id}
              config={cfg}
              query={queries[idx]}
              now={now}
              index={startIndex + i}
            />
          );
        })}
      </div>
    </section>
  );
}

function Dashboard() {
  const queryClient = useQueryClient();
  const balances = useAllBalances();
  const blockQuery = useBlockNumber();
  useTicker(1000);
  const now = Date.now();

  const anyFetching = balances.some((q) => q.isFetching) || blockQuery.isFetching;
  const lastUpdated = Math.max(
    0,
    ...balances.map((q) => q.dataUpdatedAt ?? 0),
  );

  const rewards = BALANCE_CONFIGS.filter((c) => c.category === "reward");
  const deposits = BALANCE_CONFIGS.filter((c) => c.category === "deposit");

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["celo-block"] });
  };

  return (
    <div className="app-shell min-h-screen w-full text-foreground">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-12">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-primary/40 bg-primary/10">
                <Coins className="h-4 w-4 text-primary" />
                <div className="absolute inset-0 rounded-lg bg-primary/5 blur-md" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  MiniPay Balance Monitor
                </h1>
                <p className="text-xs text-muted-foreground">
                  Real-time treasury view across Celo on-chain accounts
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-3 md:items-end">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-2 backdrop-blur-sm">
              <span className="flex items-center gap-2 text-xs">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    blockQuery.isError
                      ? "bg-destructive"
                      : "bg-emerald-500 pulse-dot",
                  )}
                />
                <span className="text-muted-foreground">
                  {blockQuery.isError ? "Disconnected" : "Live"}
                </span>
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="font-mono text-xs text-muted-foreground">
                {blockQuery.data
                  ? `Block #${new Intl.NumberFormat("en-US").format(blockQuery.data)}`
                  : "—"}
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-xs text-muted-foreground">
                {lastUpdated ? timeAgo(lastUpdated, now) : "—"}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={handleRefresh}
                disabled={anyFetching}
                aria-label="Refresh"
              >
                <RefreshCw
                  className={cn(
                    "h-3.5 w-3.5",
                    anyFetching && "animate-spin",
                  )}
                />
              </Button>
            </div>
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-12">
          {rewards.length > 0 && (
            <CategorySection
              title="Rewards"
              description="MiniPay reward distribution accounts"
              icon={<Gift className="h-4 w-4" />}
              configs={rewards}
              queries={balances}
              now={now}
              startIndex={0}
            />
          )}
          {deposits.length > 0 && (
            <CategorySection
              title="Deposits"
              description="Operational deposit treasuries"
              icon={<Box className="h-4 w-4" />}
              configs={deposits}
              queries={balances}
              now={now}
              startIndex={rewards.length}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <Activity className="h-3 w-3" />
            <span>Direct read from Celo mainnet · forno.celo.org</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>All values are public on-chain data</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Dashboard />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
