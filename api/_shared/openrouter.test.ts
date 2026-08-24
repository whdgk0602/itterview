import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { callOpenRouter, OpenRouterError } from './openrouter'

describe('callOpenRouter', () => {
  beforeEach(() => {
    vi.stubEnv('OPENROUTER_API_KEY', 'test-key')
    vi.stubEnv('OPENROUTER_MODEL', 'test-model:free')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('성공 응답에서 message content를 반환한다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: '안녕하세요' } }] }),
      }),
    )

    const result = await callOpenRouter([{ role: 'user', content: 'hi' }])
    expect(result).toBe('안녕하세요')
  })

  it('429 응답이면 OpenRouterError(429)를 던진다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }),
    )

    await expect(callOpenRouter([{ role: 'user', content: 'hi' }])).rejects.toMatchObject({
      status: 429,
    })
  })

  it('일반 실패 응답이면 OpenRouterError를 던진다', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    )

    await expect(callOpenRouter([{ role: 'user', content: 'hi' }])).rejects.toBeInstanceOf(
      OpenRouterError,
    )
  })

  it('환경변수가 없으면 OpenRouterError를 던진다', async () => {
    vi.unstubAllEnvs()
    await expect(callOpenRouter([{ role: 'user', content: 'hi' }])).rejects.toBeInstanceOf(
      OpenRouterError,
    )
  })
})
