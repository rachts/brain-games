"use client"

import { useAccessibility } from "@/hooks/use-accessibility"
import { Button } from "@/components/ui/button"
import type React from "react"

interface AccessibleGameButtonProps {
  onClick: () => void
  children: React.ReactNode
  ariaLabel: string
  narrationText?: string
  disabled?: boolean
}

export function AccessibleGameButton({
  onClick,
  children,
  ariaLabel,
  narrationText,
  disabled,
}: AccessibleGameButtonProps) {
  const { speak, handleKeyboardNavigation } = useAccessibility()

  const handleClick = () => {
    if (narrationText) {
      speak(narrationText)
    }
    onClick()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    handleKeyboardNavigation(e, {
      onEnter: handleClick,
      onSpace: handleClick,
    })
  }

  return (
    <Button onClick={handleClick} onKeyDown={handleKeyDown} aria-label={ariaLabel} disabled={disabled} tabIndex={0}>
      {children}
    </Button>
  )
}
