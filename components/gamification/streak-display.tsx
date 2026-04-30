"use client"

import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

export function StreakDisplay() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="glass p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
        <div className="text-3xl font-bold text-primary">{user.currentStreak || 0}</div>
        <div className="text-xs text-muted-foreground mt-1">days</div>
      </Card>
      <Card className="glass p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">Best Streak</div>
        <div className="text-3xl font-bold text-accent">{user.bestStreak || 0}</div>
        <div className="text-xs text-muted-foreground mt-1">days</div>
      </Card>
    </div>
  )
}
