import { type NextRequest, NextResponse } from "next/server"
import type { TrailStep, Trail } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const { trailId, step }: { trailId: string; step: TrailStep } = await request.json()

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    // TODO: Replace with actual database integration
    // For now, return mock successful response
    const mockTrail: Trail = {
      id: trailId,
      query: "mock query",
      createdAt: new Date().toISOString(),
      steps: [step],
      score: 0,
    }

    return NextResponse.json({ trail: mockTrail, ok: true })
  } catch (error) {
    console.error("Trail append API error:", error)
    return NextResponse.json({ error: "Trail append failed" }, { status: 500 })
  }
}
