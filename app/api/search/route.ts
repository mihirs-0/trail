import { type NextRequest, NextResponse } from "next/server"
import type { SourceCard, SearchParams } from "@/lib/types"

// Mock data for the API endpoints
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

export async function POST(request: NextRequest) {
  try {
    const { query, params }: { query: string; params: SearchParams } = await request.json()

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000))

    // TODO: Replace with actual search provider integration (Parallel/Sonar/Brave)
    // For now, return filtered mock data
    const filteredCards = mockSourceCards
      .filter((card) => params.buckets.includes(card.bucket))
      .filter(
        (card) =>
          card.title.toLowerCase().includes(query.toLowerCase()) ||
          card.snippet.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, params.k)
      .map((card) => ({
        ...card,
        // Randomize tangents based on serendipity
        tangents:
          params.sigma > 0.5
            ? ["quantum computing", "AI governance", "robotics integration"].sort(() => Math.random() - 0.5).slice(0, 3)
            : card.tangents,
      }))

    return NextResponse.json({ cards: filteredCards })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
