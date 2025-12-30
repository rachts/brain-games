"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Discussion {
  id: string
  title: string
  content: string
  username: string
  gameId?: string
  likes: number
  repliesCount: number
  createdAt: string
}

export function CommunityDiscussions() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDiscussions()
  }, [])

  async function fetchDiscussions() {
    try {
      const response = await fetch("/api/community/discussions")
      const data = await response.json()
      setDiscussions(data.discussions || [])
    } catch (error) {
      console.error("[v0] Error fetching discussions:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading discussions...</div>
  }

  return (
    <div className="space-y-4">
      <Button className="w-full">Start New Discussion</Button>
      {discussions.map((discussion) => (
        <Card key={discussion.id} className="glass p-6 hover:bg-card/60 transition-smooth cursor-pointer">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{discussion.title}</h3>
                <p className="text-sm text-muted-foreground">by {discussion.username}</p>
              </div>
              {discussion.gameId && <Badge variant="outline">{discussion.gameId}</Badge>}
            </div>
            <p className="text-muted-foreground line-clamp-2">{discussion.content}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>❤️ {discussion.likes} likes</span>
              <span>💬 {discussion.repliesCount} replies</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
