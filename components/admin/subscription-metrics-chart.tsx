"use client"

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts"

interface SubscriptionMetricsChartProps {
  data: any[]
}

const COLORS = ["var(--primary)", "var(--secondary)", "var(--accent)"]

export function SubscriptionMetricsChart({ data }: SubscriptionMetricsChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="subscriber_count" nameKey="plan_type" cx="50%" cy="50%" outerRadius={100} label>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
