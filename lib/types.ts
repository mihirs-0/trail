export type Bucket = "encyclopedia" | "primary" | "news" | "blog" | "forum" | "dataset"

export type SourceCard = {
  url: string
  title: string
  domain: string
  bucket: Bucket
  snippet: string
  publishedAt?: string // ISO
  tangents: string[] // search queries only
}

export type TrailStep =
  | { type: "open"; url: string; title: string; domain: string; ts: string }
  | { type: "branch"; query: string; ts: string }
  | { type: "note"; text: string; ts: string }

export type Trail = {
  id: string
  query: string
  createdAt: string
  steps: TrailStep[]
  score: number
}

export type SearchParams = {
  k: number
  lambda: number // MMR λ 0..1
  sigma: number // serendipity 0..1
  provider: "parallel" | "sonar" | "brave"
  buckets: Bucket[]
  contrarian: boolean
}

export type AppState = {
  // Search settings
  provider: "parallel" | "sonar" | "brave"
  lambda: number
  sigma: number
  k: number
  buckets: Bucket[]
  contrarian: boolean

  // Current trail
  currentTrail: Trail | null

  // Metrics
  outboundClicks: number
  uniqueDomains: Set<string>
  depth: number

  // UI state
  isLoading: boolean
  currentCards: SourceCard[]
  error: string | null
}
