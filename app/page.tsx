"use client"

import { useState, useCallback, useEffect } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { TopNav } from "@/components/dashboard/top-nav"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { IndiaHeatmap } from "@/components/dashboard/india-heatmap"
import { ResourcePanel } from "@/components/dashboard/resource-panel"
import { ShelterTable } from "@/components/dashboard/shelter-table"
import { QuickAlerts } from "@/components/dashboard/quick-alerts"
import { ActionPlan } from "@/components/dashboard/action-plan"
import { WhatIfSimulation } from "@/components/dashboard/what-if-simulation"
import {
  translations,
  initialAlerts,
  initialResources,
  initialShelters,
  initialActionPlan,
  stateRisks,
  simulationData,
} from "@/lib/dashboard-store"
import type { Alert, Resource, ActionStep } from "@/lib/dashboard-store"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  // Core state
  const [language, setLanguage] = useState("en")
  const [isOnline, setIsOnline] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [activeNavItem, setActiveNavItem] = useState("dashboard")
  const [selectedState, setSelectedState] = useState<string | null>("Bihar")

  // Data state
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [resources, setResources] = useState<Resource[]>(initialResources)
  const [actionSteps, setActionSteps] = useState<ActionStep[]>(initialActionPlan)
  const [simulationPercentage, setSimulationPercentage] = useState(20)

  // Dynamic KPI state
  const [riskScore, setRiskScore] = useState(78)
  const [confidence, setConfidence] = useState(92)

  const t = translations[language] || translations.en

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Simulated risk fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setRiskScore((prev) => {
        const change = Math.floor(Math.random() * 5) - 2
        return Math.max(0, Math.min(100, prev + change))
      })
      setConfidence((prev) => {
        const change = Math.floor(Math.random() * 3) - 1
        return Math.max(80, Math.min(99, prev + change))
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Handlers
  const handleMarkAlertRead = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)))
  }, [])

  const handleAutoOptimize = useCallback(() => {
    setResources((prev) =>
      prev.map((r) => ({
        ...r,
        current: Math.min(r.total, r.current + Math.floor(Math.random() * 5) + 2),
      }))
    )
  }, [])

  const handleToggleStep = useCallback((id: number) => {
    setActionSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
    )
  }, [])

  const handleExecutePlan = useCallback(() => {
    setActionSteps((prev) => prev.map((s) => ({ ...s, completed: true })))
  }, [])

  const handleStateSelect = useCallback((state: string) => {
    setSelectedState((prev) => (prev === state ? null : state))
  }, [])

  // Compute safe/high risk zone counts
  const safeZones = stateRisks.filter((s) => s.riskLevel === "low").length
  const highRiskZones = stateRisks.filter(
    (s) => s.riskLevel === "high" || s.riskLevel === "critical"
  ).length
  const totalZones = stateRisks.length

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "lg:relative fixed inset-y-0 left-0 z-50 transition-transform duration-300",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          activeItem={activeNavItem}
          onItemClick={(item) => {
            setActiveNavItem(item)
            setMobileSidebarOpen(false)
          }}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          t={t}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          language={language}
          onLanguageChange={setLanguage}
          isOnline={isOnline}
          alerts={alerts}
          onMarkAlertRead={handleMarkAlertRead}
          onSidebarToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          t={t}
        />

        {/* Offline Banner */}
        {!isOnline && (
          <div className="px-4 py-2 bg-warning/20 border-b border-warning/30">
            <p className="text-xs text-warning font-medium text-center">
              Offline Mode - Showing cached data
            </p>
          </div>
        )}

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="flex gap-4 max-w-[1600px] mx-auto">
            {/* Left + Center Content */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* KPI Cards */}
              <KpiCards
                riskScore={riskScore}
                confidence={confidence}
                safeZones={safeZones}
                totalZones={totalZones}
                highRiskZones={highRiskZones}
                t={t}
              />

              {/* Heatmap */}
              <IndiaHeatmap
                states={stateRisks}
                selectedState={selectedState}
                onStateSelect={handleStateSelect}
                t={t}
              />

              {/* Bottom Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ResourcePanel
                  resources={resources}
                  onAutoOptimize={handleAutoOptimize}
                  t={t}
                />
                <ShelterTable shelters={initialShelters} t={t} />
                <ActionPlan
                  steps={actionSteps}
                  onToggleStep={handleToggleStep}
                  onExecutePlan={handleExecutePlan}
                  t={t}
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="hidden xl:flex flex-col gap-4 w-[300px] shrink-0">
              <QuickAlerts
                alerts={alerts}
                onMarkRead={handleMarkAlertRead}
                t={t}
              />
              <ActionPlan
                steps={actionSteps}
                onToggleStep={handleToggleStep}
                onExecutePlan={handleExecutePlan}
                t={t}
              />
              <WhatIfSimulation
                simulationPercentage={simulationPercentage}
                onPercentageChange={setSimulationPercentage}
                data={simulationData}
                t={t}
              />
            </div>

            {/* Mobile: What-If & Alerts below main */}
          </div>

          {/* Show right sidebar items below on smaller screens */}
          <div className="xl:hidden space-y-4 mt-4 max-w-[1600px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAlerts
                alerts={alerts}
                onMarkRead={handleMarkAlertRead}
                t={t}
              />
              <WhatIfSimulation
                simulationPercentage={simulationPercentage}
                onPercentageChange={setSimulationPercentage}
                data={simulationData}
                t={t}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
