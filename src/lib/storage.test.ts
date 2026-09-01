import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  saveState,
  clearState,
  createInitialState,
  appendHistoryEntry,
  hasAnsweredToday,
  serializeState,
  parseBackup,
} from './storage'
import type { UserProfile } from '../../types'

const profile: UserProfile = {
  targetJob: '프론트엔드 개발자',
  focusTopic: '운영체제(OS)',
  difficultyLevel: '보통',
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('loadState', () => {
  it('저장된 값이 없으면 status: empty를 반환한다', () => {
    expect(loadState()).toEqual({ status: 'empty' })
  })

  it('저장된 값이 깨진 JSON이면 status: corrupted를 반환한다', () => {
    window.localStorage.setItem('ai-coaching-mvp:state', '{not valid json')
    expect(loadState()).toEqual({ status: 'corrupted' })
  })

  it('필수 필드가 없는 값이면 status: corrupted를 반환한다', () => {
    window.localStorage.setItem('ai-coaching-mvp:state', JSON.stringify({ foo: 'bar' }))
    expect(loadState()).toEqual({ status: 'corrupted' })
  })

  it('saveState로 저장한 값을 status: ok로 그대로 불러온다', () => {
    const state = createInitialState(profile)
    saveState(state)
    expect(loadState()).toEqual({ status: 'ok', state })
  })
})

describe('clearState', () => {
  it('저장된 값을 지우면 다시 status: empty가 된다', () => {
    saveState(createInitialState(profile))
    clearState()
    expect(loadState()).toEqual({ status: 'empty' })
  })
})

describe('appendHistoryEntry', () => {
  it('원본 state를 변경하지 않고 새 history를 추가한 state를 반환한다', () => {
    const state = createInitialState(profile)
    const entry = { date: '2026-08-23', question: 'Q', isCorrect: true, feedback: 'F' }
    const next = appendHistoryEntry(state, entry)
    expect(state.history).toHaveLength(0)
    expect(next.history).toEqual([entry])
  })
})

describe('hasAnsweredToday', () => {
  it('오늘 날짜의 history 항목이 있으면 true를 반환한다', () => {
    const state = appendHistoryEntry(createInitialState(profile), {
      date: '2026-08-23',
      question: 'Q',
      isCorrect: true,
      feedback: 'F',
    })
    expect(hasAnsweredToday(state, '2026-08-23')).toBe(true)
  })

  it('오늘 날짜의 history 항목이 없으면 false를 반환한다', () => {
    const state = createInitialState(profile)
    expect(hasAnsweredToday(state, '2026-08-23')).toBe(false)
  })
})

describe('serializeState / parseBackup', () => {
  it('serializeState로 만든 문자열을 parseBackup으로 되돌리면 원본 state와 같다', () => {
    const state = appendHistoryEntry(createInitialState(profile), {
      date: '2026-08-23',
      question: 'Q',
      isCorrect: true,
      feedback: 'F',
    })
    const raw = serializeState(state)
    expect(parseBackup(raw)).toEqual(state)
  })

  it('깨진 JSON 문자열이면 null을 반환한다', () => {
    expect(parseBackup('{not valid json')).toBeNull()
  })

  it('필수 필드가 없는 값이면 null을 반환한다', () => {
    expect(parseBackup(JSON.stringify({ foo: 'bar' }))).toBeNull()
  })
})
