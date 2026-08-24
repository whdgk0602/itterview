import { useCallback, useState } from 'react'
import type { AIGradeResponse } from '../../types'

export function useSubmitAnswer() {
  const [result, setResult] = useState<AIGradeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitAnswer = useCallback(async (question: string, answer: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      })
      if (!res.ok) throw new Error('채점에 실패했습니다.')
      const data = (await res.json()) as AIGradeResponse
      setResult(data)
      return data
    } catch {
      setError('답변을 채점하지 못했어요. 다시 시도해주세요.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, submitAnswer }
}
