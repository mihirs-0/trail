"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ExternalLink,
  GitBranch,
  StickyNote,
  Play,
  ChevronLeft,
  RotateCcw,
  Share,
  Download,
  Plus,
  Info,
  Clock,
  TrendingUp,
} from "lucide-react"
import { useTrailStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import type { TrailStep } from "@/lib/types"

function TrailStepComponent({ step, index, depth = 0 }: { step: TrailStep; index: number; depth?: number }) {
  const getStepIcon = () => {
    switch (step.type) {
      case "open":
        return <ExternalLink className="h-3 w-3 text-blue-600 dark:text-blue-400" />
      case "branch":
        return <GitBranch className="h-3 w-3 text-green-600 dark:text-green-400" />
      case "note":
        return <StickyNote className="h-3 w-3 text-orange-600 dark:text-orange-400" />
    }
  }

  const getStepContent = () => {
    switch (step.type) {
      case "open":
        return (
          <div className="min-w-0 flex-1">
            <div
              className="text-sm font-medium line-clamp-1 group-hover:text-primary cursor-pointer transition-colors"
              onClick={() => window.open(step.url, "_blank", "noopener")}
            >
              {step.title}
            </div>
            <div className="text-xs text-muted-foreground">{step.domain}</div>
          </div>
        )
      case "branch":
        return (
          <div className="min-w-0 flex-1">
            <div className="text-sm line-clamp-2 font-medium text-green-700 dark:text-green-300">"{step.query}"</div>
            <div className="text-xs text-muted-foreground">New search branch</div>
          </div>
        )
      case "note":
        return (
          <div className="min-w-0 flex-1">
            <div className="text-sm line-clamp-3 italic text-orange-700 dark:text-orange-300">{step.text}</div>
            <div className="text-xs text-muted-foreground">Personal note</div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group"
      style={{ marginLeft: `${depth * 16}px` }}
    >
      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="mt-0.5 flex-shrink-0">{getStepIcon()}</div>
        {getStepContent()}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(step.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0">
            #{index + 1}
          </Badge>
        </div>
      </div>
      {depth > 0 && (
        <div
          className="absolute left-3 top-0 bottom-0 w-px bg-border"
          style={{ marginLeft: `${(depth - 1) * 16}px` }}
        />
      )}
    </motion.div>
  )
}

function ExplorationScorePopover({ score }: { score: number }) {
  const { currentTrail, outboundClicks, uniqueDomains, depth } = useTrailStore()

  if (!currentTrail) return null

  const branches = currentTrail.steps.filter((s) => s.type === "branch").length
  const notes = currentTrail.steps.filter((s) => s.type === "note").length
  const primaryClicks = currentTrail.steps.filter(
    (s) => s.type === "open" && (s.domain.includes("wikipedia") || s.domain.includes("arxiv")),
  ).length
  const returns = depth > 2 ? 1 : 0

  // Calculate same domain repeats penalty
  const domainCounts = new Map<string, number>()
  currentTrail.steps.forEach((step) => {
    if (step.type === "open") {
      domainCounts.set(step.domain, (domainCounts.get(step.domain) || 0) + 1)
    }
  })
  const sameDomainRepeats = Array.from(domainCounts.values())
    .filter((count) => count > 1)
    .reduce((sum, count) => sum + (count - 1), 0)

  const components = [
    { label: "Branches", value: branches, multiplier: 10, formula: "10×log₂(1+branches)" },
    { label: "Unique Domains", value: uniqueDomains.size, multiplier: 6, formula: "6×log₂(1+domains)" },
    { label: "Primary Sources", value: primaryClicks, multiplier: 8, formula: "8×primary clicks" },
    { label: "Notes", value: notes, multiplier: 4, formula: "4×notes" },
    { label: "Deep Exploration", value: returns, multiplier: 12, formula: "12×returns" },
    { label: "Same Domain Penalty", value: sameDomainRepeats, multiplier: -5, formula: "-5×repeats" },
  ]

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 h-auto p-1">
          <Badge
            variant="secondary"
            className="gap-1 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            <TrendingUp className="h-3 w-3" />
            <span className="font-mono">{score}</span>
            <Info className="h-3 w-3" />
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <h4 className="font-medium">Exploration Score Breakdown</h4>
          </div>

          <div className="space-y-2 text-sm">
            {components.map((component, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium">{component.label}</div>
                  <div className="text-xs text-muted-foreground">{component.formula}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs">{component.value}</div>
                  <div className={`text-xs ${component.multiplier > 0 ? "text-green-600" : "text-red-600"}`}>
                    {component.multiplier > 0 ? "+" : ""}
                    {Math.round(
                      component.multiplier === 10
                        ? component.multiplier * Math.log2(1 + component.value)
                        : component.multiplier === 6
                          ? component.multiplier * Math.log2(1 + component.value)
                          : component.multiplier * component.value,
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-2">
            <div className="flex items-center justify-between font-medium">
              <span>Total Score</span>
              <span className="font-mono">{score}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function TrailPane() {
  const [noteText, setNoteText] = useState("")
  const [replayIndex, setReplayIndex] = useState(-1)
  const [isReplaying, setIsReplaying] = useState(false)

  const { currentTrail, addTrailStep, exportTrail, getExplorationScore, performSearch } = useTrailStore()

  const score = getExplorationScore()

  const handleAddNote = () => {
    if (noteText.trim()) {
      addTrailStep({
        type: "note",
        text: noteText.trim(),
        ts: new Date().toISOString(),
      })
      setNoteText("")
    }
  }

  const handleShare = async () => {
    if (currentTrail) {
      const url = `${window.location.origin}/trail/${currentTrail.id}`
      try {
        await navigator.clipboard.writeText(url)
        // TODO: Show toast notification
        console.log("Trail URL copied to clipboard")
      } catch (err) {
        console.error("Failed to copy URL:", err)
      }
    }
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

  const handleReplayStart = () => {
    setIsReplaying(true)
    setReplayIndex(0)
  }

  const handleReplayNext = () => {
    if (currentTrail && replayIndex < currentTrail.steps.length - 1) {
      const nextIndex = replayIndex + 1
      setReplayIndex(nextIndex)

      const step = currentTrail.steps[nextIndex]
      if (step.type === "branch") {
        performSearch(step.query)
      } else if (step.type === "open") {
        window.open(step.url, "_blank", "noopener")
      }
    }
  }

  const handleReplayPrev = () => {
    if (replayIndex > 0) {
      setReplayIndex(replayIndex - 1)
    }
  }

  const handleReplayStop = () => {
    setIsReplaying(false)
    setReplayIndex(-1)
  }

  const getStepsWithDepth = () => {
    if (!currentTrail) return []

    const stepsWithDepth: Array<{ step: TrailStep; index: number; depth: number }> = []
    let currentDepth = 0

    currentTrail.steps.forEach((step, index) => {
      if (step.type === "branch") {
        currentDepth++
      }
      stepsWithDepth.push({ step, index, depth: Math.max(0, currentDepth - 1) })
    })

    return stepsWithDepth
  }

  if (!currentTrail) {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="text-4xl">🗺️</div>
          <h3 className="text-lg font-medium">No active trail</h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            Start a search to begin tracking your exploration journey through diverse sources
          </p>
          <div className="text-xs text-muted-foreground">
            <kbd className="px-2 py-1 bg-muted rounded mr-1">n</kbd>
            to add notes •<kbd className="px-2 py-1 bg-muted rounded mx-1">g</kbd>
            to replay
          </div>
        </motion.div>
      </div>
    )
  }

  const stepsWithDepth = getStepsWithDepth()

  return (
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Trail</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs gap-1">
              <Clock className="h-3 w-3" />
              {currentTrail.steps.length} steps
            </Badge>
            <ExplorationScorePopover score={score} />
          </div>
        </div>
        <div className="text-sm text-muted-foreground line-clamp-2 mb-2">"{currentTrail.query}"</div>
        <div className="text-xs text-muted-foreground">Started {new Date(currentTrail.createdAt).toLocaleString()}</div>
      </div>

      {/* Replay Controls */}
      {isReplaying && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 bg-muted/50 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Replay Mode</span>
            <Button variant="ghost" size="sm" onClick={handleReplayStop}>
              Stop
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReplayPrev} disabled={replayIndex <= 0}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground flex-1 text-center">
              Step {replayIndex + 1} of {currentTrail.steps.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReplayNext}
              disabled={replayIndex >= currentTrail.steps.length - 1}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Trail Steps */}
      <ScrollArea className="flex-1 -mx-2 relative">
        <div className="space-y-1 px-2 relative">
          {stepsWithDepth.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Your trail will appear here as you explore sources and branch into new topics
            </div>
          ) : (
            <AnimatePresence>
              {stepsWithDepth
                .slice()
                .reverse()
                .map(({ step, index, depth }, reverseIndex) => (
                  <div key={`${step.ts}-${index}`} className="relative">
                    <TrailStepComponent step={step} index={stepsWithDepth.length - 1 - reverseIndex} depth={depth} />
                    {isReplaying && stepsWithDepth.length - 1 - reverseIndex === replayIndex && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-primary/10 rounded-lg border-2 border-primary/30"
                      />
                    )}
                  </div>
                ))}
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>

      {/* Add Note */}
      <div className="mt-4 space-y-3">
        <div className="flex gap-2">
          <Input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note to your trail..."
            onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
            className="text-sm"
          />
          <Button onClick={handleAddNote} size="sm" disabled={!noteText.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Replay Controls */}
        {!isReplaying && currentTrail.steps.length > 0 && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleReplayStart}>
              <Play className="h-4 w-4 mr-1" />
              Replay
            </Button>
            <Button variant="outline" size="sm" onClick={handleReplayStop} disabled>
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
          </div>
        )}

        {/* Export/Share */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare} className="flex-1 bg-transparent">
            <Share className="h-4 w-4 mr-1" />
            Share Trail
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-1" />
            Export JSON
          </Button>
        </div>
      </div>
    </div>
  )
}
