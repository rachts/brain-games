"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

interface StreakData {
  current_streak: number
  best_streak: number
}

export function StreakDisplay() {
  const [streak, setStreak] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreak = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from("user_stats")
          .select("current_streak, best_streak")
          .eq("user_id", user.id)
          .single()

        setStreak(data)
      }
      setLoading(false)
    }

    fetchStreak()
  }, [])

  if (loading) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="glass p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">Current Streak</div>
        <div className="text-3xl font-bold text-primary">{streak?.current_streak || 0}</div>
        <div className="text-xs text-muted-foreground mt-1">days</div>
      </Card>
      <Card className="glass p-4 text-center">
        <div className="text-sm text-muted-foreground mb-1">Best Streak</div>
        <div className="text-3xl font-bold text-accent">{streak?.best_streak || 0}</div>
        <div className="text-xs text-muted-foreground mt-1">days</div>
      </Card>
    </div>
  )
}
