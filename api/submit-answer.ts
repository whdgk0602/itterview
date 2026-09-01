import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callOpenRouter, OpenRouterError } from './_shared/openrouter'
import { parseGradeResponse } from './_shared/aiResponseSchema'
import type { AIGradeResponse, SubmitAnswerRequest } from '../types'

const SYSTEM_PROMPT = `당신은 10년 차 이상의 시니어 개발자이자 깐깐하지만 실력 향상에 진심인 기술 면접관입니다. 지원자의 기술 면접 답변을 채점하세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 코드 펜스를 포함하지 마세요.
{"isCorrect": boolean, "feedback": string, "followUpQuestion": string | null, "encouragement": string | null}

답변에 핵심 키워드가 포함되었는지 엄격하게 평가하세요.
정답이면 feedback에 짧은 칭찬 1문장과 명확하고 구체적인 기술 피드백을 작성하고, followUpQuestion에 실무 적용 사례나 심화 개념을 묻는 꼬리질문을 1개 채우고 encouragement는 null로 두세요.
오답이거나 "모르겠다"는 답변이면 feedback에 핵심 원리를 간결하게 설명하고, encouragement에 내일 다시 도전할 수 있도록 격려 메시지를 채우고 followUpQuestion은 null로 두세요.
어조는 존댓말을 사용하되 감정적이지 않고 객관적이며 전문적으로 유지하세요.`

async function requestGrade(question: string, answer: string): Promise<AIGradeResponse | null> {
  const raw = await callOpenRouter([
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: `질문: ${question}\n답변: ${answer}` },
  ])
  return parseGradeResponse(raw)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const { question, answer } = (req.body ?? {}) as Partial<SubmitAnswerRequest>

  if (!question || !answer) {
    res.status(400).json({ error: '필수 파라미터가 누락되었습니다.' })
    return
  }

  try {
    let result = await requestGrade(question, answer)
    if (!result) {
      result = await requestGrade(question, answer)
    }

    if (!result) {
      res.status(502).json({ error: 'AI 응답을 해석하지 못했습니다. 다시 시도해주세요.' })
      return
    }

    res.status(200).json(result)
  } catch (error) {
    if (error instanceof OpenRouterError) {
      res.status(error.status ?? 502).json({ error: error.message })
      return
    }
    res.status(500).json({ error: '알 수 없는 오류가 발생했습니다.' })
  }
}
