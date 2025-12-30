"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ChallengeCompletionChartProps {
  data: any[]
}

export function ChallengeCompletionChart({ data }: ChallengeCompletionChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="game_id" stroke="var(--muted-foreground)" />
        <YAxis stroke="var(--muted-foreground)" />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="completion_rate" fill="var(--primary)" />
      </BarChart>
    </ResponsiveContainer>
  )
}
