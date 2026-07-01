"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { GenreCount } from "./stats";

type Props = {
  data: GenreCount[];
};

const COLORS = [
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#ec4899",
  "#84cc16",
];

export function GenreChart({ data }: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card p-4">
      <h2 className="text-sm font-semibold">장르 분포</h2>

      {data.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          완독한 책이 쌓이면 장르 분포가 표시됩니다.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="genre"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((entry, i) => (
                <Cell key={entry.genre} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--foreground)",
                fontSize: 12,
              }}
              formatter={(value, name) => [`${value}권`, name]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
