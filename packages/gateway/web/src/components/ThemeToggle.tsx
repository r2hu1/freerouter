import { useState } from "react"

import { MoonIcon, SunIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function isDark() {
  return document.documentElement.classList.contains("dark")
}

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(isDark)

  function toggle() {
    const next = !isDark()
    document.documentElement.classList.toggle("dark", next)
    document.documentElement.style.colorScheme = next ? "dark" : "light"
    try {
      localStorage.setItem("fr-theme", next ? "dark" : "light")
    } catch {}
    setDark(next)
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className={cn("text-muted-foreground", className)}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
