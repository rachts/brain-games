"use client"

import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"

export function XPProgress() {
  const { user, isLoading } = useAuth()

  if (isLoading || !user) return null

  const xpInCurrentLevel = (user.xp || 0) % 100
  const progressPercent = (xpInCurrentLevel / 100) * 100

  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Level {user.level || 1}</div>
        <div className="text-xs text-muted-foreground">{xpInCurrentLevel}/100 XP</div>
      </div>
      <div className="w-full bg-card/50 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </Card>
  )
}
