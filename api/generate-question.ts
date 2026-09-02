import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callOpenRouter, OpenRouterError } from './_shared/openrouter.js'
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
        content: `당신은 10년 차 이상의 시니어 개발자이자 깐깐하지만 실력 향상에 진심인 기술 면접관입니다. 지원자 직무는 "${targetJob}"이고, 오늘의 주제는 "${focusTopic}", 오늘의 난이도는 "${difficultyLevel}"입니다.
난이도가 "기초"라면 최근 오답으로 조정되었을 수 있으니, 질책하지 않는 편안한 어조로 해당 주제의 가장 기초적인 개념을 확인하는 질문을 출제하세요.
존댓말을 사용하되 감정적이지 않고 객관적이며 전문적인 어조를 유지하세요.
면접 질문을 하나만, 질문 텍스트만 출력하세요. 다른 설명이나 인사말을 붙이지 마세요.`,
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
