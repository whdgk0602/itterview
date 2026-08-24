import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './generate-question'
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

describe('generate-question handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('POST가 아니면 405를 반환한다', async () => {
    const req = { method: 'GET', body: {} } as any
    const res = mockRes()
    await handler(req, res as any)
    expect(res.statusCode).toBe(405)
  })

  it('필수 파라미터가 없으면 400을 반환한다', async () => {
    const req = { method: 'POST', body: {} } as any
    const res = mockRes()
    await handler(req, res as any)
    expect(res.statusCode).toBe(400)
  })

  it('정상 요청이면 200과 question을 반환한다', async () => {
    vi.spyOn(openrouter, 'callOpenRouter').mockResolvedValue('가상 메모리란 무엇인가요?')
    const req = {
      method: 'POST',
      body: { targetJob: '백엔드 개발자', focusTopic: '운영체제(OS)', difficultyLevel: '보통' },
    } as any
    const res = mockRes()
    await handler(req, res as any)
    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ question: '가상 메모리란 무엇인가요?' })
  })

  it('OpenRouterError가 발생하면 해당 status로 응답한다', async () => {
    vi.spyOn(openrouter, 'callOpenRouter').mockRejectedValue(
      new openrouter.OpenRouterError('한도 초과', 429),
    )
    const req = {
      method: 'POST',
      body: { targetJob: '백엔드 개발자', focusTopic: '운영체제(OS)', difficultyLevel: '보통' },
    } as any
    const res = mockRes()
    await handler(req, res as any)
    expect(res.statusCode).toBe(429)
  })
})
