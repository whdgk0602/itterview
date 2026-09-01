import { describe, it, expect } from 'vitest'
import { calculateStreak } from './streak'

describe('calculateStreak', () => {
  it('오늘 이미 체크인했다면 스트릭을 그대로 유지한다', () => {
    expect(calculateStreak(5, '2026-08-23', '2026-08-23')).toBe(5)
  })

  it('어제 체크인했다면 스트릭을 1 증가시킨다', () => {
    expect(calculateStreak(5, '2026-08-22', '2026-08-23')).toBe(6)
  })

  it('하루 결석(2일 차이)이면 유예로 스트릭을 1 증가시킨다', () => {
    expect(calculateStreak(5, '2026-08-21', '2026-08-23')).toBe(6)
  })

  it('이틀 이상 결석(3일 이상 차이)이면 스트릭을 1로 리셋한다', () => {
    expect(calculateStreak(5, '2026-08-20', '2026-08-23')).toBe(1)
  })

  it('아주 오래 전 마지막 체크인이면 스트릭을 1로 리셋한다', () => {
    expect(calculateStreak(0, '2020-01-01', '2026-08-23')).toBe(1)
  })

  it('한 번도 체크인한 적이 없으면(빈 문자열) 스트릭을 1로 시작한다', () => {
    expect(calculateStreak(0, '', '2026-08-23')).toBe(1)
  })
})
