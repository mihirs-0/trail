import type { SourceCard, TrailStep, Trail, SearchParams } from "./types"

// Mock data for development
const mockSourceCards: SourceCard[] = [
  {
    url: "https://en.wikipedia.org/wiki/Artificial_intelligence",
    title: "Artificial Intelligence - Wikipedia",
    domain: "wikipedia.org",
    bucket: "encyclopedia",
    snippet:
      "Artificial intelligence (AI) is intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans and animals.",
    publishedAt: "2024-01-15T10:00:00Z",
    tangents: ["machine learning basics", "AI ethics debate", "neural networks explained"],
  },
  {
    url: "https://arxiv.org/abs/2301.00001",
    title: "Large Language Models and Their Applications",
    domain: "arxiv.org",
    bucket: "primary",
    snippet:
      "This paper explores the current state and future directions of large language models in various applications.",
    publishedAt: "2024-01-10T14:30:00Z",
    tangents: ["transformer architecture", "LLM training methods", "AI safety research"],
  },
  {
    url: "https://techcrunch.com/2024/01/20/ai-breakthrough",
    title: "Major AI Breakthrough Announced by Leading Tech Company",
    domain: "techcrunch.com",
    bucket: "news",
    snippet:
      "A significant advancement in artificial intelligence has been announced, promising to revolutionize how we interact with technology.",
    publishedAt: "2024-01-20T09:15:00Z",
    tangents: ["tech industry trends", "AI commercialization", "startup funding AI"],
  },
  {
    url: "https://blog.openai.com/gpt-insights",
    title: "Understanding GPT: A Deep Dive into Language Models",
    domain: "blog.openai.com",
    bucket: "blog",
    snippet: "An in-depth exploration of how GPT models work and their implications for the future of AI.",
    publishedAt: "2024-01-18T16:45:00Z",
    tangents: ["GPT architecture", "language model training", "AI research methods"],
  },
  {
    url: "https://reddit.com/r/MachineLearning/comments/ai_discussion",
    title: "Discussion: Current State of AI Research",
    domain: "reddit.com",
    bucket: "forum",
    snippet: "Community discussion about the latest developments in AI research and their practical applications.",
    publishedAt: "2024-01-19T12:20:00Z",
    tangents: ["AI research community", "ML paper discussions", "AI career advice"],
  },
  {
    url: "https://huggingface.co/datasets/ai-benchmark",
    title: "AI Performance Benchmark Dataset",
    domain: "huggingface.co",
    bucket: "dataset",
    snippet: "Comprehensive dataset for benchmarking AI model performance across various tasks and domains.",
    publishedAt: "2024-01-12T08:00:00Z",
    tangents: ["AI benchmarking", "model evaluation", "dataset creation"],
  },
]

const mockTangents = [
  "quantum computing applications",
  "AI in healthcare",
  "robotics integration",
  "natural language processing",
  "computer vision advances",
  "AI governance policies",
]

// API client with mock mode support
class ApiClient {
  private baseUrl: string
  private mockMode: boolean

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api"
    this.mockMode = process.env.NEXT_PUBLIC_MOCK === "1"
  }

  async search(query: string, params: SearchParams): Promise<{ cards: SourceCard[] }> {
    if (this.mockMode) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400))

      // Return filtered mock data based on buckets
      const filteredCards = mockSourceCards
        .filter((card) => params.buckets.includes(card.bucket))
        .slice(0, params.k)
        .map((card) => ({
          ...card,
          // Randomize tangents based on serendipity
          tangents: params.sigma > 0.5 ? mockTangents.sort(() => Math.random() - 0.5).slice(0, 3) : card.tangents,
        }))

      return { cards: filteredCards }
    }

    // TODO: Replace with actual API integration
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, params }),
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`)
    }

    return response.json()
  }

  async generateTangents(context: { title?: string; url?: string; context?: string }): Promise<{ queries: string[] }> {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 200))

      // Return random tangents
      const shuffled = mockTangents.sort(() => Math.random() - 0.5)
      return { queries: shuffled.slice(0, 3) }
    }

    // TODO: Replace with actual API integration
    const response = await fetch(`${this.baseUrl}/tangents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(context),
    })

    if (!response.ok) {
      throw new Error(`Tangent generation failed: ${response.statusText}`)
    }

    return response.json()
  }

  async appendTrailStep(trailId: string, step: TrailStep): Promise<{ trail: Trail; ok: boolean }> {
    if (this.mockMode) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Mock successful response
      return {
        trail: {
          id: trailId,
          query: "mock query",
          createdAt: new Date().toISOString(),
          steps: [step],
          score: 0,
        },
        ok: true,
      }
    }

    // TODO: Replace with actual API integration
    const response = await fetch(`${this.baseUrl}/trail/append`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trailId, step }),
    })

    if (!response.ok) {
      throw new Error(`Trail append failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getTrail(id: string): Promise<Trail> {
    if (this.mockMode) {
      throw new Error("Trail not found in mock mode")
    }

    // TODO: Replace with actual API integration
    const response = await fetch(`${this.baseUrl}/trail/${id}`)

    if (!response.ok) {
      throw new Error(`Trail fetch failed: ${response.statusText}`)
    }

    return response.json()
  }

  async healthCheck(): Promise<{ ok: boolean }> {
    if (this.mockMode) {
      return { ok: true }
    }

    // TODO: Replace with actual API integration
    const response = await fetch(`${this.baseUrl}/health`)
    return response.json()
  }
}

export const apiClient = new ApiClient()
