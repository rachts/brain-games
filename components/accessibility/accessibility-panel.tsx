"use client"

import { useState } from "react"
import { useAccessibility } from "@/hooks/use-accessibility"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AccessibilityPanel() {
  const { settings, updateSettings } = useAccessibility()
  const [isOpen, setIsOpen] = useState(false)

  if (!settings) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="rounded-full w-12 h-12 p-0"
        aria-label="Accessibility settings"
      >
        ♿
      </Button>

      {isOpen && (
        <Card className="glass absolute bottom-16 right-0 w-80 p-4 space-y-4">
          <h3 className="font-semibold">Accessibility Settings</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.voiceNarration}
                onChange={(e) => updateSettings({ voiceNarration: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Voice Narration</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSettings({ keyboardNavigation: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Keyboard Navigation</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">High Contrast</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.reduceMotion}
                onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Reduce Motion</span>
            </label>

            <div className="space-y-2">
              <label className="text-sm font-medium">Font Size</label>
              <select
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: e.target.value as "small" | "medium" | "large" })}
                className="w-full px-2 py-1 rounded border border-border bg-background text-foreground"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
