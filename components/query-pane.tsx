"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Upload, Download, Loader2 } from "lucide-react"
import { useTrailStore } from "@/lib/store"
import { useKeyboardShortcuts } from "@/lib/keyboard"
import type { Bucket } from "@/lib/types"

const bucketLabels: Record<Bucket, string> = {
  encyclopedia: "📘 Encyclopedia",
  primary: "📄 Primary",
  news: "📰 News",
  blog: "✍️ Blog",
  forum: "💬 Forum",
  dataset: "📊 Dataset",
}

export function QueryPane() {
  const [query, setQuery] = useState("")
  const {
    k,
    lambda,
    buckets,
    contrarian,
    currentTrail,
    outboundClicks,
    uniqueDomains,
    depth,
    isLoading,
    setK,
    setLambda,
    setBuckets,
    setContrarian,
    startNewTrail,
    performSearch,
    exportTrail,
    importTrail,
  } = useTrailStore()

  useKeyboardShortcuts()

  const handleSearch = async () => {
    if (query.trim()) {
      if (currentTrail && currentTrail.query !== query.trim()) {
        // Start new trail if query is different
        startNewTrail(query.trim())
      } else if (!currentTrail) {
        // Start new trail if no current trail
        startNewTrail(query.trim())
      } else {
        // Perform search with existing trail
        await performSearch(query.trim())
      }
    }
  }

  const handleBucketToggle = (bucket: Bucket, checked: boolean) => {
    if (checked) {
      setBuckets([...buckets, bucket])
    } else {
      setBuckets(buckets.filter((b) => b !== bucket))
    }
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          importTrail(content)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleExport = () => {
    const json = exportTrail()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `trail-${currentTrail?.id || "export"}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  useState(() => {
    if (currentTrail && currentTrail.query !== query) {
      setQuery(currentTrail.query)
    }
  })

  return (
    <div className="p-4 space-y-4">
      {/* Search Input */}
      <div className="space-y-2">
        <Label htmlFor="query">Search Query</Label>
        <div className="flex gap-2">
          <Input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSearch()}
            disabled={isLoading}
          />
          <Button onClick={handleSearch} size="sm" disabled={isLoading || !query.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Advanced Controls */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm">Advanced Controls</AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* K Results */}
            <div className="space-y-2">
              <Label className="text-sm">Results (k): {k}</Label>
              <Slider
                value={[k]}
                onValueChange={([value]) => setK(value)}
                min={4}
                max={12}
                step={1}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Lambda (MMR) */}
            <div className="space-y-2">
              <Label className="text-sm">Diversity (λ): {lambda.toFixed(1)}</Label>
              <Slider
                value={[lambda]}
                onValueChange={([value]) => setLambda(value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
                disabled={isLoading}
              />
            </div>

            {/* Diversity Buckets */}
            <div className="space-y-2">
              <Label className="text-sm">Diversity Buckets</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(bucketLabels).map(([bucket, label]) => (
                  <div key={bucket} className="flex items-center space-x-2">
                    <Checkbox
                      id={bucket}
                      checked={buckets.includes(bucket as Bucket)}
                      onCheckedChange={(checked) => handleBucketToggle(bucket as Bucket, checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor={bucket} className="text-xs">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Contrarian Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="contrarian" className="text-sm">
                Contrarian Mode
              </Label>
              <Switch id="contrarian" checked={contrarian} onCheckedChange={setContrarian} disabled={isLoading} />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Trail Actions */}
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          onClick={() => {
            setQuery("")
            startNewTrail("")
          }}
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Start New Trail
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImport} disabled={isLoading}>
            <Upload className="h-4 w-4 mr-1" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={!currentTrail || isLoading}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-2 pt-4 border-t">
        <h3 className="text-sm font-medium">Trail Stats</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Clicks:</span>
            <Badge variant="secondary" className="text-xs">
              {outboundClicks}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Domains:</span>
            <Badge variant="secondary" className="text-xs">
              {uniqueDomains.size}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Depth:</span>
            <Badge variant="secondary" className="text-xs">
              {depth}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
