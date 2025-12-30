"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

export function GuestSyncBanner() {
  const { isGuest, user, syncGuestData } = useAuth()
  const [isSyncing, setIsSyncing] = useState(false)

  if (!isGuest || !user) return null

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      await syncGuestData()
      toast.success("Your progress has been synced!")
    } catch (error) {
      toast.error("Failed to sync progress")
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 glass p-4 rounded-lg border border-primary/50 max-w-sm">
      <p className="text-sm font-medium mb-2">Guest Progress</p>
      <p className="text-xs text-muted-foreground mb-3">
        Your game progress is saved locally. Sync to your account to keep it permanently.
      </p>
      <Button size="sm" onClick={handleSync} disabled={isSyncing} className="w-full">
        {isSyncing ? "Syncing..." : "Sync Now"}
      </Button>
    </div>
  )
}
