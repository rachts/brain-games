"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface RetentionChartProps {
  data: any[]
}

export function RetentionChart({ data }: RetentionChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="week" stroke="var(--muted-foreground)" />
        <YAxis stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="new_users" stroke="var(--primary)" strokeWidth={2} />
        <Line type="monotone" dataKey="week_1_retention" stroke="var(--secondary)" strokeWidth={2} />
        <Line type="monotone" dataKey="week_2_retention" stroke="var(--accent)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}
