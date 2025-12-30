"use client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface MigrationStatusProps {
  isActive: boolean
  progress: number
  message: string
  onCancel?: () => void
}

export function MigrationStatus({ isActive, progress, message, onCancel }: MigrationStatusProps) {
  if (!isActive) return null

  return (
    <Card className="fixed bottom-4 left-4 w-96 p-4 glass border-primary/50">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Syncing Your Progress</h3>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>

        <Progress value={progress} className="h-2" />

        <p className="text-sm text-muted-foreground">{message}</p>

        <div className="text-xs text-muted-foreground">{Math.round(progress)}% complete</div>
      </div>
    </Card>
  )
}
