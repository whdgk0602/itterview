import type { AppState, HistoryEntry, UserProfile } from '../../types'

const STORAGE_KEY = 'ai-coaching-mvp:state'

export type LoadStateResult =
  | { status: 'empty' }
  | { status: 'corrupted' }
  | { status: 'ok'; state: AppState }

export function loadState(): LoadStateResult {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return { status: 'empty' }

  try {
    const parsed = JSON.parse(raw) as AppState
    if (
      !parsed.userProfile ||
      typeof parsed.streak !== 'number' ||
      typeof parsed.lastCheckIn !== 'string' ||
      !Array.isArray(parsed.history)
    ) {
      return { status: 'corrupted' }
    }
    return { status: 'ok', state: parsed }
  } catch {
    return { status: 'corrupted' }
  }
}

export function saveState(state: AppState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function createInitialState(userProfile: UserProfile, today: string): AppState {
  return {
    userProfile,
    streak: 0,
    lastCheckIn: today,
    history: [],
  }
}

export function appendHistoryEntry(state: AppState, entry: HistoryEntry): AppState {
  return {
    ...state,
    history: [...state.history, entry],
  }
}

export function hasAnsweredToday(state: AppState, today: string): boolean {
  return state.history.some((entry) => entry.date === today)
}
