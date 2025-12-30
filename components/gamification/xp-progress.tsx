"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"

interface XPData {
  xp_level: number
  total_xp: number
}

export function XPProgress() {
  const [xp, setXP] = useState<XPData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchXP = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase.from("user_stats").select("xp_level, total_xp").eq("user_id", user.id).single()

        setXP(data)
      }
      setLoading(false)
    }

    fetchXP()
  }, [])

  if (loading) return null

  const xpInCurrentLevel = xp ? xp.total_xp % 100 : 0
  const progressPercent = (xpInCurrentLevel / 100) * 100

  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">Level {xp?.xp_level || 1}</div>
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
