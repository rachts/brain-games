import type React from "react"
export interface AccessibilitySettings {
  voiceNarration: boolean
  keyboardNavigation: boolean
  highContrast: boolean
  fontSize: "small" | "medium" | "large"
  reduceMotion: boolean
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  voiceNarration: false,
  keyboardNavigation: true,
  highContrast: false,
  fontSize: "medium",
  reduceMotion: false,
}

// Get accessibility settings from localStorage
export function getAccessibilitySettings(): AccessibilitySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS

  const stored = localStorage.getItem("accessibility-settings")
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS
}

// Save accessibility settings
export function saveAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof window === "undefined") return

  localStorage.setItem("accessibility-settings", JSON.stringify(settings))
  applyAccessibilitySettings(settings)
}

// Apply accessibility settings to DOM
export function applyAccessibilitySettings(settings: AccessibilitySettings): void {
  if (typeof document === "undefined") return

  const root = document.documentElement

  // Apply font size
  const fontSizeMap = {
    small: "14px",
    medium: "16px",
    large: "18px",
  }
  root.style.fontSize = fontSizeMap[settings.fontSize]

  // Apply high contrast
  if (settings.highContrast) {
    root.classList.add("high-contrast")
  } else {
    root.classList.remove("high-contrast")
  }

  // Apply reduce motion
  if (settings.reduceMotion) {
    root.classList.add("reduce-motion")
  } else {
    root.classList.remove("reduce-motion")
  }
}

// Text-to-speech utility
export async function speak(text: string, settings: AccessibilitySettings): Promise<void> {
  if (!settings.voiceNarration || typeof window === "undefined") return

  // Cancel any ongoing speech
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1

  window.speechSynthesis.speak(utterance)
}

// Stop speech
export function stopSpeech(): void {
  if (typeof window !== "undefined") {
    window.speechSynthesis.cancel()
  }
}

// Keyboard navigation helper
export function handleKeyboardNavigation(
  event: React.KeyboardEvent,
  callbacks: {
    onEnter?: () => void
    onSpace?: () => void
    onArrowUp?: () => void
    onArrowDown?: () => void
    onArrowLeft?: () => void
    onArrowRight?: () => void
    onEscape?: () => void
  },
): void {
  switch (event.key) {
    case "Enter":
      callbacks.onEnter?.()
      break
    case " ":
      event.preventDefault()
      callbacks.onSpace?.()
      break
    case "ArrowUp":
      event.preventDefault()
      callbacks.onArrowUp?.()
      break
    case "ArrowDown":
      event.preventDefault()
      callbacks.onArrowDown?.()
      break
    case "ArrowLeft":
      event.preventDefault()
      callbacks.onArrowLeft?.()
      break
    case "ArrowRight":
      event.preventDefault()
      callbacks.onArrowRight?.()
      break
    case "Escape":
      callbacks.onEscape?.()
      break
  }
}
