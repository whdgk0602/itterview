import { describe, it, expect } from 'vitest'
import { formatLocalDate } from './date'

describe('formatLocalDate', () => {
  it('연-월-일을 2자리로 패딩하여 반환한다', () => {
    expect(formatLocalDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('월/일이 두 자리인 경우도 올바르게 반환한다', () => {
    expect(formatLocalDate(new Date(2026, 10, 23))).toBe('2026-11-23')
  })
})
