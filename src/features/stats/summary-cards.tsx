import type { Stats } from "./stats";

type Props = {
  stats: Stats;
};

function Card({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-serif text-[28px] font-bold tabular-nums">
        {value}
        {suffix && (
          <span className="ml-0.5 font-sans text-sm font-normal text-muted-foreground">{suffix}</span>
        )}
      </span>
    </div>
  );
}

export function SummaryCards({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card label="올해 완독" value={stats.thisYearDone.toLocaleString()} suffix="권" />
      <Card label="전체 완독" value={stats.totalDone.toLocaleString()} suffix="권" />
      <Card label="누적 페이지" value={stats.totalPages.toLocaleString()} suffix="p" />
      <Card
        label="평균 평점"
        value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
        suffix={stats.avgRating != null ? "점" : undefined}
      />
    </div>
  );
}
