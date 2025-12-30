"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface AdminMetricsGridProps {
  metrics: any
}

export function AdminMetricsGrid({ metrics }: AdminMetricsGridProps) {
  const metricCards = [
    {
      label: "Total Users",
      value: metrics?.totalUsers || 0,
      change: metrics?.userGrowth || 0,
      icon: "👥",
    },
    {
      label: "Daily Active Users",
      value: metrics?.dailyActiveUsers?.[0]?.active_users || 0,
      change: metrics?.dauChange || 0,
      icon: "📊",
    },
    {
      label: "Total Games Played",
      value: metrics?.totalGamesPlayed || 0,
      change: metrics?.gamesPlayedChange || 0,
      icon: "🎮",
    },
    {
      label: "Active Subscriptions",
      value: metrics?.activeSubscriptions || 0,
      change: metrics?.subscriptionChange || 0,
      icon: "💳",
    },
    {
      label: "Avg Session Duration",
      value: `${metrics?.avgSessionDuration || 0}m`,
      change: metrics?.sessionDurationChange || 0,
      icon: "⏱️",
    },
    {
      label: "User Retention (7d)",
      value: `${metrics?.retentionRate || 0}%`,
      change: metrics?.retentionChange || 0,
      icon: "📈",
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {metricCards.map((card, index) => (
        <Card key={index} className="glass p-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-3xl">{card.icon}</span>
            <Badge variant={card.change >= 0 ? "default" : "destructive"}>
              {card.change >= 0 ? "+" : ""}
              {card.change}%
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm mb-2">{card.label}</p>
          <p className="text-3xl font-bold">{card.value.toLocaleString()}</p>
        </Card>
      ))}
    </div>
  )
}
