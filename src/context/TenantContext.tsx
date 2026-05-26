"use client"

import { createContext, useContext, useEffect } from "react"
import { useTheme } from "next-themes"
import type { TenantConfig } from "@/lib/tenant-config"

const TenantContext = createContext<TenantConfig | null>(null)

function injectAccentTokens(config: TenantConfig, isDark: boolean): void {
  const r = document.documentElement
  r.style.setProperty("--chat-accent", isDark ? config.accentDark : config.accentLight)
  r.style.setProperty(
    "--chat-accent-hover",
    isDark ? config.accentHoverDark : config.accentHoverLight
  )
  r.style.setProperty(
    "--chat-accent-dim",
    isDark ? config.accentDimDark : config.accentDimLight
  )
}

interface TenantProviderProps {
  config: TenantConfig
  children: React.ReactNode
}

export function TenantProvider({ config, children }: TenantProviderProps) {
  const { resolvedTheme } = useTheme()

  // Re-inject accent tokens whenever the resolved theme flips, so white-label
  // brokers with different light/dark accents get the right values in both modes.
  useEffect(() => {
    injectAccentTokens(config, resolvedTheme === "dark")
  }, [config, resolvedTheme])

  return <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
}

export function useTenant(): TenantConfig {
  const ctx = useContext(TenantContext)
  if (!ctx) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return ctx
}
