"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsChartProps {
  data: Record<string, number>
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    games: value,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
        <YAxis stroke="rgba(255,255,255,0.5)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(15, 23, 42, 0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="games" fill="hsl(var(--color-primary))" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
