export interface ChatMessage {
  role: 'system' | 'user'
  content: string
}

export class OpenRouterError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'OpenRouterError'
    this.status = status
  }
}

export async function callOpenRouter(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL

  if (!apiKey || !model) {
    throw new OpenRouterError('OpenRouter 설정(OPENROUTER_API_KEY/OPENROUTER_MODEL)이 누락되었습니다.')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, messages }),
  })

  if (response.status === 429) {
    throw new OpenRouterError('요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', 429)
  }

  if (!response.ok) {
    throw new OpenRouterError(`OpenRouter 요청 실패 (status: ${response.status})`, response.status)
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[]
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    throw new OpenRouterError('OpenRouter 응답에 콘텐츠가 없습니다.')
  }

  return content
}
