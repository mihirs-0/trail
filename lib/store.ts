import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { AppState, Trail, TrailStep, SourceCard, Bucket, SearchParams } from "./types"
import { apiClient } from "./api"

interface TrailStore extends AppState {
  // Actions
  setProvider: (provider: "parallel" | "sonar" | "brave") => void
  setLambda: (lambda: number) => void
  setSigma: (sigma: number) => void
  setK: (k: number) => void
  setBuckets: (buckets: Bucket[]) => void
  setContrarian: (contrarian: boolean) => void

  // Trail management
  startNewTrail: (query: string) => void
  addTrailStep: (step: TrailStep) => void
  loadTrail: (trail: Trail) => void

  // Search functionality
  performSearch: (query: string) => Promise<void>
  generateTangents: (card: SourceCard) => Promise<string[]>

  // UI state
  setCurrentCards: (cards: SourceCard[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Computed values
  getExplorationScore: () => number
  getSearchParams: () => SearchParams

  // Import/Export
  exportTrail: () => string
  importTrail: (json: string) => void

  // Metrics
  incrementOutboundClicks: (domain: string) => void
  incrementDepth: () => void
}

export const useTrailStore = create<TrailStore>()(
  persist(
    (set, get) => ({
      // Initial state
      provider: "parallel",
      lambda: 0.6,
      sigma: 0.5,
      k: 8,
      buckets: ["encyclopedia", "primary", "news", "blog", "forum", "dataset"],
      contrarian: false,

      currentTrail: null,
      outboundClicks: 0,
      uniqueDomains: new Set(),
      depth: 0,

      isLoading: false,
      currentCards: [],
      error: null,

      // Basic setters
      setProvider: (provider) => set({ provider }),
      setLambda: (lambda) => set({ lambda }),
      setSigma: (sigma) => set({ sigma }),
      setK: (k) => set({ k }),
      setBuckets: (buckets) => set({ buckets }),
      setContrarian: (contrarian) => set({ contrarian }),

      // Trail management
      startNewTrail: (query) => {
        const trail: Trail = {
          id: nanoid(),
          query,
          createdAt: new Date().toISOString(),
          steps: [],
          score: 0,
        }
        set({
          currentTrail: trail,
          outboundClicks: 0,
          uniqueDomains: new Set(),
          depth: 0,
          currentCards: [],
          error: null,
        })

        // Automatically perform search
        get().performSearch(query)
      },

      addTrailStep: (step) => {
        const { currentTrail } = get()
        if (!currentTrail) return

        const updatedTrail = {
          ...currentTrail,
          steps: [...currentTrail.steps, step],
        }

        set({ currentTrail: updatedTrail })

        // Update metrics based on step type
        if (step.type === "open") {
          get().incrementOutboundClicks(step.domain)
        } else if (step.type === "branch") {
          get().incrementDepth()
        }

        // Persist to API in background
        apiClient.appendTrailStep(currentTrail.id, step).catch(console.error)
      },

      loadTrail: (trail) => {
        // Calculate metrics from trail steps
        const domains = new Set<string>()
        let clicks = 0
        let depth = 0

        trail.steps.forEach((step) => {
          if (step.type === "open") {
            clicks++
            domains.add(step.domain)
          } else if (step.type === "branch") {
            depth++
          }
        })

        set({
          currentTrail: trail,
          outboundClicks: clicks,
          uniqueDomains: domains,
          depth,
        })
      },

      // Search functionality
      performSearch: async (query) => {
        const { getSearchParams, setLoading, setError, setCurrentCards } = get()

        setLoading(true)
        setError(null)

        try {
          const params = getSearchParams()
          const result = await apiClient.search(query, params)
          setCurrentCards(result.cards)
        } catch (error) {
          setError(error instanceof Error ? error.message : "Search failed")
          setCurrentCards([])
        } finally {
          setLoading(false)
        }
      },

      generateTangents: async (card) => {
        try {
          const result = await apiClient.generateTangents({
            title: card.title,
            url: card.url,
            context: card.snippet,
          })
          return result.queries
        } catch (error) {
          console.error("Failed to generate tangents:", error)
          return []
        }
      },

      // UI state
      setCurrentCards: (cards) => set({ currentCards: cards }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Computed values
      getSearchParams: () => {
        const state = get()
        return {
          k: state.k,
          lambda: state.lambda,
          sigma: state.sigma,
          provider: state.provider,
          buckets: state.buckets,
          contrarian: state.contrarian,
        }
      },

      getExplorationScore: () => {
        const { currentTrail, outboundClicks, uniqueDomains, depth } = get()
        if (!currentTrail) return 0

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

        const score =
          10 * Math.log2(1 + branches) +
          6 * Math.log2(1 + uniqueDomains.size) +
          8 * primaryClicks +
          4 * notes +
          12 * returns -
          5 * sameDomainRepeats

        return Math.max(0, Math.round(score))
      },

      // Import/Export
      exportTrail: () => {
        const { currentTrail } = get()
        if (!currentTrail) return "{}"
        return JSON.stringify(currentTrail, null, 2)
      },

      importTrail: (json) => {
        try {
          const trail = JSON.parse(json) as Trail
          get().loadTrail(trail)
          set({ error: null })
        } catch (error) {
          set({ error: "Invalid trail JSON format" })
        }
      },

      // Metrics
      incrementOutboundClicks: (domain) => {
        const { outboundClicks, uniqueDomains } = get()
        const newUniqueDomains = new Set(uniqueDomains)
        newUniqueDomains.add(domain)

        set({
          outboundClicks: outboundClicks + 1,
          uniqueDomains: newUniqueDomains,
        })
      },

      incrementDepth: () => {
        set({ depth: get().depth + 1 })
      },
    }),
    {
      name: "trail-storage",
      partialize: (state) => ({
        provider: state.provider,
        lambda: state.lambda,
        sigma: state.sigma,
        k: state.k,
        buckets: state.buckets,
        contrarian: state.contrarian,
        currentTrail: state.currentTrail,
      }),
      // Custom serialization to handle Set objects
      serialize: (state) => {
        const serializable = {
          ...state,
          uniqueDomains: Array.from(state.uniqueDomains || []),
        }
        return JSON.stringify(serializable)
      },
      deserialize: (str) => {
        const parsed = JSON.parse(str)
        return {
          ...parsed,
          uniqueDomains: new Set(parsed.uniqueDomains || []),
        }
      },
    },
  ),
)
