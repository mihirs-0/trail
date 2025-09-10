"use client"

import { useEffect } from "react"
import { useTrailStore } from "./store"

export function useKeyboardShortcuts() {
  const { currentCards, addTrailStep, generateTangents } = useTrailStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).contentEditable === "true"
      ) {
        return
      }

      switch (e.key) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          e.preventDefault()
          const index = Number.parseInt(e.key) - 1
          const card = currentCards[index]
          if (card) {
            window.open(card.url, "_blank", "noopener")
            addTrailStep({
              type: "open",
              url: card.url,
              title: card.title,
              domain: card.domain,
              ts: new Date().toISOString(),
            })
          }
          break
        }
        case "t": {
          e.preventDefault()
          // Generate tangents for the first card (or focused card)
          if (currentCards.length > 0) {
            generateTangents(currentCards[0])
              .then((tangents) => {
                console.log("Generated tangents:", tangents)
              })
              .catch(console.error)
          }
          break
        }
        case "n": {
          e.preventDefault()
          // Focus note input
          const noteInput = document.querySelector('input[placeholder*="note" i]') as HTMLInputElement
          if (noteInput) {
            noteInput.focus()
          }
          break
        }
        case "*": {
          e.preventDefault()
          // Mark first card as core (simplified implementation)
          console.log("Mark as core shortcut - first card")
          break
        }
        case "/": {
          e.preventDefault()
          // Focus query input
          const queryInput = document.querySelector('input[placeholder*="search" i]') as HTMLInputElement
          if (queryInput) {
            queryInput.focus()
          }
          break
        }
        case "g": {
          e.preventDefault()
          // Replay from start (simplified implementation)
          console.log("Replay shortcut")
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentCards, addTrailStep, generateTangents])
}
