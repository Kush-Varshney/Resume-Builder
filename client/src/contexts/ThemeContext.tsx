"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Helper to check if browser is available (for SSR)
const isBrowser = typeof window !== "undefined"

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Start with a placeholder state, will be updated in useEffect
  const [theme, setThemeState] = useState<Theme>("light")
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize theme once on mount
  useEffect(() => {
    // Check for saved theme
    const savedTheme = isBrowser ? localStorage.getItem("theme") as Theme | null : null

    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      setThemeState(savedTheme)
    } else if (isBrowser && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("dark")
    }
    
    setIsInitialized(true)
  }, [])

  // Apply theme class when theme changes
  useEffect(() => {
    if (!isInitialized || !isBrowser) return;
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    try {
      localStorage.setItem("theme", theme)
    } catch (error) {
      console.error("Could not save theme preference", error)
    }
  }, [theme, isInitialized])

  // Listen for system preference changes
  useEffect(() => {
    if (!isBrowser) return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly chosen a theme
      if (!localStorage.getItem("theme")) {
        setThemeState(e.matches ? "dark" : "light")
      }
    }
    
    // Add event listener with newer addEventListener API if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === "light" ? "dark" : "light"
      return newTheme
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
