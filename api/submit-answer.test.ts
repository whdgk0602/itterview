import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './submit-answer'
import * as openrouter from './_shared/openrouter'

function mockRes() {
  return {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
  }
}

const validReq = {
  method: 'POST',
  body: { question: '가상 메모리란?', answer: '물리 메모리를 확장한 개념입니다.' },
} as any

describe('submit-answer handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('POST가 아니면 405를 반환한다', async () => {
    const res = mockRes()
    await handler({ method: 'GET', body: {} } as any, res as any)
    expect(res.statusCode).toBe(405)
  })

  it('필수 파라미터가 없으면 400을 반환한다', async () => {
    const res = mockRes()
    await handler({ method: 'POST', body: {} } as any, res as any)
    expect(res.statusCode).toBe(400)
  })

  it('첫 응답이 유효한 JSON이면 그대로 반환한다', async () => {
    vi.spyOn(openrouter, 'callOpenRouter').mockResolvedValue(
      JSON.stringify({ isCorrect: true, feedback: 'F', followUpQuestion: 'Q2', encouragement: null }),
    )
    const res = mockRes()
    await handler(validReq, res as any)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ isCorrect: true, feedback: 'F', followUpQuestion: 'Q2', encouragement: null })
  })

  it('첫 응답 파싱 실패, 재시도 응답이 유효하면 재시도 결과를 반환한다', async () => {
    vi.spyOn(openrouter, 'callOpenRouter')
      .mockResolvedValueOnce('이건 JSON이 아님')
      .mockResolvedValueOnce(
        JSON.stringify({ isCorrect: false, feedback: 'F2', followUpQuestion: null, encouragement: 'E' }),
      )
    const res = mockRes()
    await handler(validReq, res as any)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ isCorrect: false, feedback: 'F2', followUpQuestion: null, encouragement: 'E' })
  })

  it('두 번 모두 파싱에 실패하면 502를 반환한다', async () => {
    vi.spyOn(openrouter, 'callOpenRouter').mockResolvedValue('이건 JSON이 아님')
    const res = mockRes()
    await handler(validReq, res as any)
    expect(res.statusCode).toBe(502)
  })

  it('OpenRouterError가 발생하면 해당 status로 응답한다', async () => {
    vi.spyOn(openrouter, 'callOpenRouter').mockRejectedValue(
      new openrouter.OpenRouterError('한도 초과', 429),
    )
    const res = mockRes()
    await handler(validReq, res as any)
    expect(res.statusCode).toBe(429)
  })
})
