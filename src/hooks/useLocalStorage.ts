// src/hooks/useLocalStorage.ts
import { useCallback, useState } from 'react'
import type { AppState, HistoryEntry, UserProfile } from '../../types'
import {
  appendHistoryEntry,
  clearState,
  createInitialState,
  loadState,
  parseBackup,
  saveState,
} from '../lib/storage'
import { calculateDifficulty } from '../lib/difficulty'
import { calculateStreak } from '../lib/streak'
import { todayString } from '../lib/date'

export function useLocalStorage() {
  const initialResult = loadState()
  const [state, setState] = useState<AppState | null>(
    initialResult.status === 'ok' ? initialResult.state : null,
  )
  const [isCorrupted, setIsCorrupted] = useState(initialResult.status === 'corrupted')

  const resetCorrupted = useCallback(() => {
    clearState()
    setIsCorrupted(false)
    setState(null)
  }, [])

  const completeOnboarding = useCallback((profile: UserProfile) => {
    const initial = createInitialState(profile)
    saveState(initial)
    setState(initial)
  }, [])

  const recordAnswer = useCallback((question: string, isCorrect: boolean, feedback: string) => {
    setState((prev) => {
      if (!prev) return prev

      const today = todayString()
      const entry: HistoryEntry = { date: today, question, isCorrect, feedback }
      const withHistory = appendHistoryEntry(prev, entry)
      const newStreak = calculateStreak(prev.streak, prev.lastCheckIn, today)
      const recentResults = withHistory.history.slice(-2).map((h) => h.isCorrect)
      const newDifficulty = calculateDifficulty(prev.userProfile.difficultyLevel, recentResults)

      const next: AppState = {
        ...withHistory,
        streak: newStreak,
        lastCheckIn: today,
        userProfile: { ...prev.userProfile, difficultyLevel: newDifficulty },
      }

      saveState(next)
      return next
    })
  }, [])

  const importBackup = useCallback((raw: string) => {
    const parsed = parseBackup(raw)
    if (!parsed) return false
    saveState(parsed)
    setState(parsed)
    setIsCorrupted(false)
    return true
  }, [])

  return { state, isCorrupted, resetCorrupted, completeOnboarding, recordAnswer, importBackup }
}
