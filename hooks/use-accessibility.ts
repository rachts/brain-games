"use client"

import { useEffect, useState } from "react"
import {
  getAccessibilitySettings,
  saveAccessibilitySettings,
  applyAccessibilitySettings,
  speak,
  stopSpeech,
  handleKeyboardNavigation,
} from "@/lib/accessibility"
import type { AccessibilitySettings } from "@/lib/accessibility"

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings | null>(null)

  useEffect(() => {
    const loaded = getAccessibilitySettings()
    setSettings(loaded)
    applyAccessibilitySettings(loaded)
  }, [])

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    if (!settings) return

    const updated = { ...settings, ...newSettings }
    setSettings(updated)
    saveAccessibilitySettings(updated)
  }

  return {
    settings,
    updateSettings,
    speak: (text: string) => settings && speak(text, settings),
    stopSpeech,
    handleKeyboardNavigation,
  }
}
