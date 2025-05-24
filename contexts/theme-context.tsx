"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { themes } from "@/lib/themes"

type ThemeName = keyof typeof themes | "system"

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  currentColors: typeof themes.light.colors
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>("system")
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Load theme from localStorage
    const savedSettings = localStorage.getItem("settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setTheme(settings.theme || "system")
    }

    // Detect system theme
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemTheme(mediaQuery.matches ? "dark" : "light")

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light")
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const currentColors = theme === "system" 
    ? themes[systemTheme].colors 
    : themes[theme as keyof typeof themes].colors

  useEffect(() => {
    // Apply CSS variables for the current theme
    const root = document.documentElement
    Object.entries(currentColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Set background and text color on body
    document.body.style.backgroundColor = currentColors.background
    document.body.style.color = currentColors.foreground
  }, [currentColors])

  const handleSetTheme = (newTheme: ThemeName) => {
    setTheme(newTheme)
    
    // Update localStorage
    const savedSettings = localStorage.getItem("settings")
    const settings = savedSettings ? JSON.parse(savedSettings) : {}
    settings.theme = newTheme
    localStorage.setItem("settings", JSON.stringify(settings))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, currentColors }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}