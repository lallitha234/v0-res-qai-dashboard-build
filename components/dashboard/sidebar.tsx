"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Brain,
  Map,
  Package,
  Home,
  Activity,
  Bell,
  Clock,
  WifiOff,
  Settings,
  ChevronRight,
  ChevronLeft,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  collapsed: boolean
  onToggle: () => void
  t: Record<string, string>
}

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, hasSubmenu: false },
  { key: "riskEngine", icon: Brain, hasSubmenu: true },
  { key: "heatmap", icon: Map, hasSubmenu: true },
  { key: "resources", icon: Package, hasSubmenu: true },
  { key: "shelters", icon: Home, hasSubmenu: true },
  { key: "simulation", icon: Activity, hasSubmenu: true },
  { key: "alerts", icon: Bell, hasSubmenu: false },
  { key: "history", icon: Clock, hasSubmenu: false },
]

const bottomItems = [
  { key: "offlineMode", icon: WifiOff },
  { key: "settings", icon: Settings },
]

export function Sidebar({ activeItem, onItemClick, collapsed, onToggle, t }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300 relative h-full",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-base font-bold text-foreground leading-tight tracking-tight">ResQAI</h1>
            <p className="text-[10px] text-muted-foreground leading-tight">Disaster Response AI</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-2 px-2 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => onItemClick(item.key)}
              onMouseEnter={() => setHoveredItem(item.key)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                isActive
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left truncate">{t[item.key]}</span>
                  {item.hasSubmenu && (
                    <ChevronRight
                      className={cn(
                        "w-3.5 h-3.5 transition-opacity",
                        hoveredItem === item.key ? "opacity-100" : "opacity-0"
                      )}
                    />
                  )}
                </>
              )}
              {isActive && <span className="absolute right-0 w-[3px] h-6 bg-primary rounded-l" />}
            </button>
          )
        })}
      </nav>

      {/* Bottom Items */}
      <div className="border-t border-border px-2 py-2 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon
          const isActive = activeItem === item.key
          return (
            <button
              key={item.key}
              onClick={() => onItemClick(item.key)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{t[item.key]}</span>}
            </button>
          )
        })}

        {/* System Status */}
        {!collapsed && (
          <div className="mt-2 mx-1 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-[11px] text-muted-foreground mb-1">{t.systemStatus}</p>
            <p className="text-[11px] text-muted-foreground">{t.allSystems}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold text-success">{t.operational}</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full w-[85%] rounded-full bg-warning" />
            </div>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  )
}
