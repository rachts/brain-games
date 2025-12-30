"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyActiveUsersChart } from "@/components/admin/daily-active-users-chart"
import { GamePopularityChart } from "@/components/admin/game-popularity-chart"
import { SubscriptionMetricsChart } from "@/components/admin/subscription-metrics-chart"
import { RetentionChart } from "@/components/admin/retention-chart"
import { ChallengeCompletionChart } from "@/components/admin/challenge-completion-chart"
import { AdminMetricsGrid } from "@/components/admin/admin-metrics-grid"

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      const response = await fetch("/api/admin/analytics")
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">Loading analytics...</div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold gradient-text">Admin Analytics Dashboard v2.5</h1>
              <p className="text-xl text-muted-foreground">Comprehensive platform metrics and insights</p>
            </div>

            {/* Key Metrics Grid */}
            <AdminMetricsGrid metrics={metrics} />

            {/* Charts Tabs */}
            <Tabs defaultValue="dau" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="dau">Daily Active Users</TabsTrigger>
                <TabsTrigger value="games">Game Popularity</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="retention">Retention</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
              </TabsList>

              <TabsContent value="dau" className="space-y-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">Daily Active Users Trend</h3>
                  <DailyActiveUsersChart data={metrics?.dailyActiveUsers} />
                </Card>
              </TabsContent>

              <TabsContent value="games" className="space-y-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">Game Popularity & Performance</h3>
                  <GamePopularityChart data={metrics?.gamePopularity} />
                </Card>
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">Subscription Metrics</h3>
                  <SubscriptionMetricsChart data={metrics?.subscriptionMetrics} />
                </Card>
              </TabsContent>

              <TabsContent value="retention" className="space-y-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">User Retention Rates</h3>
                  <RetentionChart data={metrics?.retentionMetrics} />
                </Card>
              </TabsContent>

              <TabsContent value="challenges" className="space-y-6">
                <Card className="glass p-6">
                  <h3 className="text-lg font-semibold mb-4">Challenge Completion Rates</h3>
                  <ChallengeCompletionChart data={metrics?.challengeCompletion} />
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  )
}
