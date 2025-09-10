import { type NextRequest, NextResponse } from "next/server"

const mockTangents = [
  "quantum computing applications",
  "AI in healthcare",
  "robotics integration",
  "natural language processing",
  "computer vision advances",
  "AI governance policies",
  "machine learning ethics",
  "neural network architectures",
  "deep learning frameworks",
  "AI safety research",
  "automated reasoning",
  "cognitive computing",
]

export async function POST(request: NextRequest) {
  try {
    const { title, url, context }: { title?: string; url?: string; context?: string } = await request.json()

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200 + Math.random() * 300))

    // TODO: Replace with actual tangent generation using AI
    // For now, return random tangents based on context
    const shuffled = mockTangents.sort(() => Math.random() - 0.5)
    const queries = shuffled.slice(0, 3)

    return NextResponse.json({ queries })
  } catch (error) {
    console.error("Tangents API error:", error)
    return NextResponse.json({ error: "Tangent generation failed" }, { status: 500 })
  }
}
