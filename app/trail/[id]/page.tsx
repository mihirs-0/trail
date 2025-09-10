"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ArrowLeft, Download } from "lucide-react"
import { useTrailStore } from "@/lib/store"
import { apiClient } from "@/lib/api"
import Link from "next/link"
import type { Trail } from "@/lib/types"

export default function TrailPage() {
  const params = useParams()
  const [trail, setTrail] = useState<Trail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { loadTrail } = useTrailStore()

  useEffect(() => {
    const fetchTrail = async () => {
      if (!params.id || typeof params.id !== "string") {
        setError("Invalid trail ID")
        setIsLoading(false)
        return
      }

      try {
        const fetchedTrail = await apiClient.getTrail(params.id)
        setTrail(fetchedTrail)
        loadTrail(fetchedTrail)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trail")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrail()
  }, [params.id, loadTrail])

  const handleExport = () => {
    if (trail) {
      const json = JSON.stringify(trail, null, 2)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `trail-${trail.id}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h1 className="text-2xl font-bold mb-2">Trail Not Found</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link href="/">
              <Button className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Trail
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Shared Trail</h1>
            <p className="text-muted-foreground">View and explore this trail</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Start New Trail
              </Button>
            </Link>
          </div>
        </div>

        {trail && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">"{trail.query}"</h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Created: {new Date(trail.createdAt).toLocaleString()}</span>
                <span>{trail.steps.length} steps</span>
                <span>Score: {trail.score}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trail.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="text-sm text-muted-foreground">#{index + 1}</div>
                    <div className="flex-1">
                      {step.type === "open" && (
                        <div>
                          <div className="font-medium">{step.title}</div>
                          <div className="text-sm text-muted-foreground">{step.domain}</div>
                        </div>
                      )}
                      {step.type === "branch" && (
                        <div>
                          <div className="font-medium text-green-700 dark:text-green-300">
                            New search: "{step.query}"
                          </div>
                        </div>
                      )}
                      {step.type === "note" && (
                        <div className="italic text-orange-700 dark:text-orange-300">{step.text}</div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{new Date(step.ts).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
