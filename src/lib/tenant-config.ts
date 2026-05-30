export interface TenantConfig {
  assistantName: string
  brokerName?: string
  logoUrl?: string
  accentLight: string
  accentDark: string
  accentHoverLight: string
  accentHoverDark: string
  accentDimLight: string
  accentDimDark: string
  welcomeMessage: string
  footerDisclaimer: string
  fcaNumber?: string
  avatarInitial: string
  defaultTheme: "light" | "dark" | "system"
}

export const DEFAULT_TENANT: TenantConfig = {
  assistantName: process.env.NEXT_PUBLIC_TENANT_NAME ?? "Annah",
  accentLight: process.env.NEXT_PUBLIC_TENANT_ACCENT_LIGHT ?? "#0F6E56",
  accentDark: process.env.NEXT_PUBLIC_TENANT_ACCENT_DARK ?? "#1D9E75",
  accentHoverLight: "#0A5240",
  accentHoverDark: "#178360",
  accentDimLight: "#E1F5EE",
  accentDimDark: "#0D3D2E",
  welcomeMessage:
    process.env.NEXT_PUBLIC_TENANT_WELCOME ??
    "I'm your Scotland-wide mortgage guidance tool.",
  footerDisclaimer:
    process.env.NEXT_PUBLIC_TENANT_DISCLAIMER ??
    "Annah provides general guidance only · Not regulated financial advice · For advice, speak to a qualified, regulated professional",
  fcaNumber: process.env.NEXT_PUBLIC_TENANT_FCA || undefined,
  avatarInitial: (process.env.NEXT_PUBLIC_TENANT_NAME ?? "Annah").charAt(0).toUpperCase() || "A",
  defaultTheme: "system",
}
