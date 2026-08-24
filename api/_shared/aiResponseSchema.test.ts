import { describe, it, expect } from 'vitest'
import { parseGradeResponse } from './aiResponseSchema'

describe('parseGradeResponse', () => {
  it('정답 케이스의 유효한 JSON을 파싱한다', () => {
    const raw = JSON.stringify({
      isCorrect: true,
      feedback: '정확합니다.',
      followUpQuestion: '그렇다면...?',
      encouragement: null,
    })
    expect(parseGradeResponse(raw)).toEqual({
      isCorrect: true,
      feedback: '정확합니다.',
      followUpQuestion: '그렇다면...?',
      encouragement: null,
    })
  })

  it('오답 케이스의 유효한 JSON을 파싱한다', () => {
    const raw = JSON.stringify({
      isCorrect: false,
      feedback: '정답은 ...',
      followUpQuestion: null,
      encouragement: '다음엔 잘할 수 있어요!',
    })
    expect(parseGradeResponse(raw)?.isCorrect).toBe(false)
  })

  it('```json 코드 펜스로 감싸진 응답도 파싱한다', () => {
    const raw = '```json\n{"isCorrect": true, "feedback": "F", "followUpQuestion": null, "encouragement": null}\n```'
    expect(parseGradeResponse(raw)?.feedback).toBe('F')
  })

  it('깨진 JSON이면 null을 반환한다', () => {
    expect(parseGradeResponse('{isCorrect: true')).toBeNull()
  })

  it('필수 필드(isCorrect)가 없으면 null을 반환한다', () => {
    const raw = JSON.stringify({ feedback: 'F', followUpQuestion: null, encouragement: null })
    expect(parseGradeResponse(raw)).toBeNull()
  })

  it('필드 타입이 잘못되면 null을 반환한다', () => {
    const raw = JSON.stringify({ isCorrect: 'yes', feedback: 'F', followUpQuestion: null, encouragement: null })
    expect(parseGradeResponse(raw)).toBeNull()
  })
})
