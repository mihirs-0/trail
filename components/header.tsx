"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle, Compass, TrendingUp } from "lucide-react"
import { useTrailStore } from "@/lib/store"

export function Header() {
  const { provider, sigma, setProvider, setSigma, getExplorationScore } = useTrailStore()

  const score = getExplorationScore()

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Trail</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Provider:</span>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parallel">Parallel</SelectItem>
                <SelectItem value="sonar">Sonar</SelectItem>
                <SelectItem value="brave">Brave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Predictable</span>
            <Slider
              value={[sigma]}
              onValueChange={([value]) => setSigma(value)}
              max={1}
              min={0}
              step={0.1}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">Surprising</span>
          </div>

          <Badge variant="secondary" className="gap-1 px-3 py-1">
            <TrendingUp className="h-3 w-3" />
            <span className="text-xs">Score:</span>
            <span className="font-mono font-medium">{score}</span>
          </Badge>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-muted-foreground">Navigation</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">1-9</kbd>
                      <span className="text-xs">Open source card</span>
                    </div>
                    <div className="flex justify-between">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">/</kbd>
                      <span className="text-xs">Focus search</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-muted-foreground">Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex justify-between">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">t</kbd>
                      <span className="text-xs">Generate tangents</span>
                    </div>
                    <div className="flex justify-between">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">n</kbd>
                      <span className="text-xs">Add note</span>
                    </div>
                    <div className="flex justify-between">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">*</kbd>
                      <span className="text-xs">Mark as core</span>
                    </div>
                    <div className="flex justify-between">
                      <kbd className="px-2 py-1 bg-muted rounded text-xs">g</kbd>
                      <span className="text-xs">Replay trail</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
