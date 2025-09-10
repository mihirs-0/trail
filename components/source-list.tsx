"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ExternalLink, Star, MoreHorizontal, AlertCircle, RefreshCw, Sparkles, Copy, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTrailStore } from "@/lib/store"
import { motion, AnimatePresence } from "framer-motion"
import type { SourceCard, Bucket } from "@/lib/types"

const bucketColors: Record<Bucket, string> = {
  encyclopedia: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  primary: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  news: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  blog: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  forum: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  dataset: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const bucketIcons: Record<Bucket, string> = {
  encyclopedia: "📘",
  primary: "📄",
  news: "📰",
  blog: "✍️",
  forum: "💬",
  dataset: "📊",
}

function SourceCardComponent({ card, index }: { card: SourceCard; index: number }) {
  const [isGeneratingTangents, setIsGeneratingTangents] = useState(false)
  const [customTangents, setCustomTangents] = useState<string[]>([])
  const [isStarred, setIsStarred] = useState(false)

  const { addTrailStep, generateTangents, performSearch } = useTrailStore()

  const handleOpen = () => {
    window.open(card.url, "_blank", "noopener")
    addTrailStep({
      type: "open",
      url: card.url,
      title: card.title,
      domain: card.domain,
      ts: new Date().toISOString(),
    })
  }

  const handleTangent = async (tangent: string) => {
    addTrailStep({
      type: "branch",
      query: tangent,
      ts: new Date().toISOString(),
    })
    await performSearch(tangent)
  }

  const handleGenerateTangents = async () => {
    setIsGeneratingTangents(true)
    try {
      const newTangents = await generateTangents(card)
      setCustomTangents(newTangents)
    } catch (error) {
      console.error("Failed to generate tangents:", error)
    } finally {
      setIsGeneratingTangents(false)
    }
  }

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(card.url)
      // TODO: Show toast notification
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  const allTangents = [...card.tangents, ...customTangents]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <Card className="group hover:shadow-md transition-all duration-200 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-primary cursor-pointer transition-colors"
                onClick={handleOpen}
              >
                {card.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {card.domain}
                </Badge>
                <Badge className={`text-xs ${bucketColors[card.bucket]}`}>
                  {bucketIcons[card.bucket]} {card.bucket}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded font-mono">{index + 1}</kbd>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3 flex-1 flex flex-col">
          {/* Snippet */}
          <div className="text-sm text-muted-foreground line-clamp-3 flex-1">
            {card.snippet}
            <div className="text-xs mt-1 opacity-75">Extracted from {card.domain}</div>
          </div>

          {/* Tangent Chips */}
          <AnimatePresence>
            {allTangents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1"
              >
                {allTangents.slice(0, 4).map((tangent, i) => (
                  <motion.div
                    key={`${tangent}-${i}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-6 text-xs px-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleTangent(tangent)}
                    >
                      {tangent}
                    </Button>
                  </motion.div>
                ))}
                {allTangents.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{allTangents.length - 4} more
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button onClick={handleOpen} size="sm" className="gap-1">
              <ExternalLink className="h-3 w-3" />
              Open
            </Button>

            <div className="flex items-center gap-1">
              <Button variant={isStarred ? "default" : "ghost"} size="sm" onClick={() => setIsStarred(!isStarred)}>
                <Star className={`h-3 w-3 ${isStarred ? "fill-current" : ""}`} />
              </Button>

              <Button variant="ghost" size="sm" onClick={handleGenerateTangents} disabled={isGeneratingTangents}>
                {isGeneratingTangents ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleCopyUrl}>
                    <Copy className="h-3 w-3 mr-2" />
                    Copy URL
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleGenerateTangents} disabled={isGeneratingTangents}>
                    <Sparkles className="h-3 w-3 mr-2" />
                    Generate more tangents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsStarred(!isStarred)}>
                    <Star className="h-3 w-3 mr-2" />
                    {isStarred ? "Remove from core" : "Mark as core"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {card.publishedAt && (
            <div className="text-xs text-muted-foreground">
              Published: {new Date(card.publishedAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function LoadingSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full mb-2" />
        <Skeleton className="h-3 w-2/3 mb-4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 text-center"
    >
      <div className="text-4xl mb-4">🔍</div>
      <h3 className="text-lg font-medium mb-2">Ready to explore</h3>
      <p className="text-muted-foreground text-sm max-w-md">
        Enter a search query to start your trail and discover diverse sources across different domains and perspectives
      </p>
      <div className="mt-4 text-xs text-muted-foreground">
        <kbd className="px-2 py-1 bg-muted rounded mr-1">/</kbd>
        to focus search •<kbd className="px-2 py-1 bg-muted rounded mx-1">1-9</kbd>
        to open results
      </div>
    </motion.div>
  )
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-64 text-center"
    >
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-medium mb-2">Something went wrong</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md">{error}</p>
      <Button onClick={onRetry} variant="outline" className="gap-2 bg-transparent">
        <RefreshCw className="h-4 w-4" />
        Try again
      </Button>
    </motion.div>
  )
}

export function SourceList() {
  const { currentCards, isLoading, error, setError, currentTrail, performSearch } = useTrailStore()

  const handleRetry = () => {
    setError(null)
    if (currentTrail?.query) {
      performSearch(currentTrail.query)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState error={error} onRetry={handleRetry} />
      </div>
    )
  }

  if (currentCards.length === 0) {
    return (
      <div className="p-6">
        <EmptyState />
      </div>
    )
  }

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {currentCards.map((card, index) => (
            <SourceCardComponent key={`${card.url}-${index}`} card={card} index={index} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
