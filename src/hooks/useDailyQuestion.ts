import { useCallback, useState } from 'react'
import type { AppState, GenerateQuestionResponse } from '../../types'
import { hasAnsweredToday } from '../lib/storage'
import { todayString } from '../lib/date'

export function useDailyQuestion(state: AppState | null) {
  const [question, setQuestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestion = useCallback(async () => {
    if (!state) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJob: state.userProfile.targetJob,
          focusTopic: state.userProfile.focusTopic,
          difficultyLevel: state.userProfile.difficultyLevel,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        setError(body?.error ?? '질문을 불러오지 못했어요. 다시 시도해주세요.')
        return
      }
      const data = (await res.json()) as GenerateQuestionResponse
      setQuestion(data.question)
    } catch {
      setError('질문을 불러오지 못했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }, [state])

  const alreadyAnsweredToday = state ? hasAnsweredToday(state, todayString()) : false

  return { question, loading, error, fetchQuestion, alreadyAnsweredToday }
}
