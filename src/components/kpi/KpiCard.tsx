// "use client" – runs in the browser so SWR can poll
"use client";
import useSWR from "swr";
import { Card, CardContent } from "@/components/ui/card";

type Snapshot = {
  timestamp: number;
  unscheduledCount: number;
  scheduledCount: number;
  inProcessCount: number;
  totalOnOrder: number;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function KpiCard() {
  const { data } = useSWR<Snapshot>("/api/kpis", fetcher, {
    refreshInterval: 30_000, // 30 s
  });

  if (!data) {
    return (
      <Card className="p-4 rounded-2xl shadow animate-pulse">
        <p className="text-sm">Loading KPIs…</p>
      </Card>
    );
  }

  const fmt = (n: number) => n.toLocaleString();

  return (
    <Card className="p-4 rounded-2xl shadow flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Shop-floor KPIs</h2>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Metric label="Unscheduled" value={fmt(data.unscheduledCount)} />
        <Metric label="Scheduled" value={fmt(data.scheduledCount)} />
        <Metric label="In&nbsp;Process" value={fmt(data.inProcessCount)} />
        <Metric label="Total&nbsp;on&nbsp;Order" value={fmt(data.totalOnOrder)} />
      </CardContent>
      <p className="text-xs text-muted-foreground">
        Updated {new Date(data.timestamp).toLocaleTimeString()}
      </p>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
