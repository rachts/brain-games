"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PublicLeaderboard } from "@/components/community/public-leaderboard"
import { BattleRoomsList } from "@/components/community/battle-rooms-list"
import { CommunityDiscussions } from "@/components/community/community-discussions"
import { CreateBattleRoomDialog } from "@/components/community/create-battle-room-dialog"

export default function CommunityPage() {
  const [showCreateBattle, setShowCreateBattle] = useState(false)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-card to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-5xl font-bold gradient-text">Community Hub</h1>
              <p className="text-xl text-muted-foreground">
                Connect with players, compete in battles, and share your achievements
              </p>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="leaderboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leaderboard">Global Leaderboard</TabsTrigger>
                <TabsTrigger value="battles">Battle Rooms</TabsTrigger>
                <TabsTrigger value="discussions">Discussions</TabsTrigger>
              </TabsList>

              <TabsContent value="leaderboard" className="space-y-6">
                <PublicLeaderboard />
              </TabsContent>

              <TabsContent value="battles" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Active Battle Rooms</h2>
                  <Button onClick={() => setShowCreateBattle(true)}>Create Battle Room</Button>
                </div>
                <BattleRoomsList />
              </TabsContent>

              <TabsContent value="discussions" className="space-y-6">
                <CommunityDiscussions />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <CreateBattleRoomDialog open={showCreateBattle} onOpenChange={setShowCreateBattle} />
    </>
  )
}
