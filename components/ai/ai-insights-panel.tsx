"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getInsights, generateInsights } from "@/lib/ai-analytics"

interface Insight {
  insight_text: string
  insight_type: string
  generated_at: string
}

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true)
      const data = await getInsights()
      setInsights(data)
      setLoading(false)
    }

    fetchInsights()
  }, [])

  const handleGenerateInsights = async () => {
    setGenerating(true)
    const newInsight = await generateInsights()
    if (newInsight) {
      setInsights([newInsight, ...insights])
    }
    setGenerating(false)
  }

  if (loading) return null

  return (
    <Card className="glass p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">AI Insights</h3>
        <Button onClick={handleGenerateInsights} disabled={generating} size="sm">
          {generating ? "Generating..." : "Generate"}
        </Button>
      </div>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No insights yet. Generate your first insight!</p>
        ) : (
          insights.slice(0, 3).map((insight, i) => (
            <div key={i} className="p-3 bg-card/50 rounded-lg border border-border/50">
              <p className="text-sm text-foreground">{insight.insight_text}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(insight.generated_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
