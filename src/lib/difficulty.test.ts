import { describe, it, expect } from 'vitest'
import { calculateDifficulty } from './difficulty'

describe('calculateDifficulty', () => {
  it('최근 2개가 연속 오답이면 한 단계 하향한다', () => {
    expect(calculateDifficulty('보통', [false, false])).toBe('기초')
  })

  it('이미 기초 단계면 연속 오답이어도 유지한다', () => {
    expect(calculateDifficulty('기초', [false, false])).toBe('기초')
  })

  it('최근 2개가 연속 정답이면 한 단계 상향한다', () => {
    expect(calculateDifficulty('보통', [true, true])).toBe('심화')
  })

  it('이미 심화 단계면 연속 정답이어도 유지한다', () => {
    expect(calculateDifficulty('심화', [true, true])).toBe('심화')
  })

  it('최근 2개 결과가 섞여 있으면 난이도를 유지한다', () => {
    expect(calculateDifficulty('보통', [true, false])).toBe('보통')
  })

  it('기록이 2개 미만이면 난이도를 유지한다', () => {
    expect(calculateDifficulty('보통', [true])).toBe('보통')
    expect(calculateDifficulty('보통', [])).toBe('보통')
  })
})
