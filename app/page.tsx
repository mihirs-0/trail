"use client"

import { Header } from "@/components/header"
import { QueryPane } from "@/components/query-pane"
import { SourceList } from "@/components/source-list"
import { TrailPane } from "@/components/trail-pane"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Query Pane */}
        <div className="w-80 border-r bg-muted/30 hidden lg:block">
          <QueryPane />
        </div>

        {/* Center - Source Results */}
        <div className="flex-1 overflow-auto">
          <SourceList />
        </div>

        {/* Right Sidebar - Trail Pane */}
        <div className="w-96 border-l bg-muted/30 hidden xl:block">
          <TrailPane />
        </div>
      </div>

      {/* Mobile Query Pane - Show on smaller screens */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <QueryPane />
      </div>

      <Toaster />
    </div>
  )
}
