import type { AIGradeResponse } from '../../types'

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return match ? match[1] : trimmed
}

export function parseGradeResponse(raw: string): AIGradeResponse | null {
  let data: unknown
  try {
    data = JSON.parse(stripCodeFence(raw))
  } catch {
    return null
  }

  if (typeof data !== 'object' || data === null) return null
  const obj = data as Record<string, unknown>

  if (typeof obj.isCorrect !== 'boolean') return null
  if (typeof obj.feedback !== 'string') return null
  if (obj.followUpQuestion !== null && typeof obj.followUpQuestion !== 'string') return null
  if (obj.encouragement !== null && typeof obj.encouragement !== 'string') return null

  return {
    isCorrect: obj.isCorrect,
    feedback: obj.feedback,
    followUpQuestion: (obj.followUpQuestion as string | null) ?? null,
    encouragement: (obj.encouragement as string | null) ?? null,
  }
}
