import type { AppState, HistoryEntry, UserProfile } from '../../types'

const STORAGE_KEY = 'ai-coaching-mvp:state'

export type LoadStateResult =
  | { status: 'empty' }
  | { status: 'corrupted' }
  | { status: 'ok'; state: AppState }

function isValidAppState(value: unknown): value is AppState {
  const parsed = value as Partial<AppState> | null
  return (
    !!parsed &&
    !!parsed.userProfile &&
    typeof parsed.streak === 'number' &&
    typeof parsed.lastCheckIn === 'string' &&
    Array.isArray(parsed.history)
  )
}

export function loadState(): LoadStateResult {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return { status: 'empty' }

  try {
    const parsed = JSON.parse(raw)
    if (!isValidAppState(parsed)) return { status: 'corrupted' }
    return { status: 'ok', state: parsed }
  } catch {
    return { status: 'corrupted' }
  }
}

export function serializeState(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function parseBackup(raw: string): AppState | null {
  try {
    const parsed = JSON.parse(raw)
    return isValidAppState(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function saveState(state: AppState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function createInitialState(userProfile: UserProfile): AppState {
  return {
    userProfile,
    streak: 0,
    lastCheckIn: '',
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
