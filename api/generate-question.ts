import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callOpenRouter, OpenRouterError } from './_shared/openrouter'
import type { GenerateQuestionRequest, GenerateQuestionResponse } from '../types'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { targetJob, focusTopic, difficultyLevel } = (req.body ?? {}) as Partial<GenerateQuestionRequest>

  if (!targetJob || !focusTopic || !difficultyLevel) {
    res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' })
    return
  }

  try {
    const question = await callOpenRouter([
      {
        role: 'system',
        content: `당신은 ${targetJob} 직군 기술 면접관입니다. 난이도는 "${difficultyLevel}"이고, 이번 주 집중 주제는 "${focusTopic}"입니다. 면접 질문을 하나만, 질문 텍스트만 출력하세요. 다른 설명이나 인사말을 붙이지 마세요.`,
      },
      { role: 'user', content: '오늘의 기술 면접 질문을 출제해주세요.' },
    ])

    const body: GenerateQuestionResponse = { question: question.trim() }
    res.status(200).json(body)
  } catch (error) {
    if (error instanceof OpenRouterError) {
      res.status(error.status ?? 502).json({ error: error.message })
      return
    }
    res.status(500).json({ error: '알 수 없는 오류가 발생했습니다.' })
  }
}
