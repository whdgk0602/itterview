# IT 기술면접 데일리 AI 코칭 서비스 (MVP) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** F1~F5(온보딩, 데일리 질문 생성, 채팅 UI, AI 채점/피드백, 스트릭)를 갖춘 동작하는 MVP 웹앱을 처음부터 구현한다.

**Architecture:** Vite + React(TS) SPA가 Local Storage에 상태를 저장하고, `/api` 아래 2개의 Vercel Serverless Function(`generate-question`, `submit-answer`)이 OpenRouter API 키를 숨기는 프록시 역할을 한다. 스트릭/난이도 계산과 AI 응답 검증은 순수 함수로 분리해 단위 테스트한다.

**Tech Stack:** TypeScript, React 18, Vite, Tailwind CSS, Vitest(+jsdom), npm, Vercel Serverless Functions(`@vercel/node`), OpenRouter API.

**Spec:** `docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md` (및 `PRD.md`, `CLAUDE.md`)

## Global Constraints

- TypeScript strict 모드 사용
- 스타일링은 Tailwind CSS만 사용 (다른 CSS 프레임워크 금지)
- 패키지 매니저는 npm
- 서버 DB/인증 없음 — Local Storage가 유일한 영속 저장소
- OpenRouter API 키는 서버 환경변수(`OPENROUTER_API_KEY`)로만 관리하고, 모든 OpenRouter 호출은 `api/_shared/openrouter.ts`를 경유한다. 클라이언트 코드에 키를 절대 노출하지 않는다
- 사용할 모델명은 하드코딩하지 않고 환경변수(`OPENROUTER_MODEL`)로 관리한다
- 자동화 테스트는 `src/lib/`와 `api/_shared/`의 순수 함수에만 작성한다 (design spec 6장). 컴포넌트/훅/E2E 테스트는 이 계획에 포함하지 않고, 대신 수동 검증 단계를 둔다
- API 실패 시 자동 재시도는 최대 1회. 무한 재시도나 실패를 조용히 삼키는 처리 금지
- UI 카피는 한국어

---

### Task 1: 프로젝트 스캐폴딩 (Vite + React + TS + Tailwind + Vitest)

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/index.css`
- Create: `src/App.tsx`
- Create: `.gitignore`
- Create: `.env.example`

**Interfaces:**
- Produces: `npm run dev` / `npm run build` / `npm test` 스크립트. 이후 모든 태스크가 이 스캐폴딩 위에서 파일을 추가한다.

- [ ] **Step 1: package.json 작성**

```json
{
  "name": "ai-coaching-mvp",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vercel/node": "^3.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: tsconfig.json 작성**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true
  },
  "include": ["src", "types", "api"]
}
```

- [ ] **Step 3: vite.config.ts 작성**

```ts
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
  },
})
```

- [ ] **Step 4: tailwind.config.js / postcss.config.js 작성**

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [],
}
```

```js
// postcss.config.js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 5: index.html 작성**

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>데일리 AI 기술면접 코칭</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: src/main.tsx, src/index.css, src/App.tsx(임시) 작성**

```tsx
// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```tsx
// src/App.tsx (Task 15에서 최종 구현으로 교체됨)
function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <p className="text-slate-500">AI 코칭 서비스 준비 중</p>
    </div>
  )
}

export default App
```

- [ ] **Step 7: .gitignore, .env.example 작성**

```
# .gitignore
node_modules
dist
.env
.env.local
.vercel
```

```
# .env.example
OPENROUTER_API_KEY=
# https://openrouter.ai/models?max_price=0 에서 사용 가능한 :free 모델을 확인 후 지정
OPENROUTER_MODEL=
```

- [ ] **Step 8: 의존성 설치 및 빌드 검증**

Run: `npm install`
Expected: 종료 코드 0, `node_modules` 생성

Run: `npm run build`
Expected: 종료 코드 0 (타입 에러 없이 `dist/` 생성)

- [ ] **Step 9: 커밋**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts tailwind.config.js postcss.config.js index.html src/main.tsx src/index.css src/App.tsx .gitignore .env.example
git commit -m "chore: scaffold Vite + React + TS + Tailwind + Vitest project"
```

---

### Task 2: 공용 타입 정의

**Files:**
- Create: `types/index.ts`

**Interfaces:**
- Produces: `DifficultyLevel`, `UserProfile`, `HistoryEntry`, `AppState`, `GenerateQuestionRequest`, `GenerateQuestionResponse`, `SubmitAnswerRequest`, `AIGradeResponse` — 이후 모든 태스크가 이 타입들을 `src`와 `api` 양쪽에서 상대경로로 import한다.

- [ ] **Step 1: types/index.ts 작성**

```ts
export type DifficultyLevel = '기초' | '보통' | '심화'

export interface UserProfile {
  targetJob: string
  focusTopic: string
  difficultyLevel: DifficultyLevel
}

export interface HistoryEntry {
  date: string // YYYY-MM-DD
  question: string
  isCorrect: boolean
  feedback: string
}

export interface AppState {
  userProfile: UserProfile
  streak: number
  lastCheckIn: string // YYYY-MM-DD
  history: HistoryEntry[]
}

export interface GenerateQuestionRequest {
  targetJob: string
  focusTopic: string
  difficultyLevel: DifficultyLevel
}

export interface GenerateQuestionResponse {
  question: string
}

export interface SubmitAnswerRequest {
  question: string
  answer: string
}

export interface AIGradeResponse {
  isCorrect: boolean
  feedback: string
  followUpQuestion: string | null
  encouragement: string | null
}
```

- [ ] **Step 2: 타입체크 검증**

Run: `npm run build`
Expected: 종료 코드 0

- [ ] **Step 3: 커밋**

```bash
git add types/index.ts
git commit -m "feat: add shared domain types"
```

---

### Task 3: 스트릭 계산 로직 (`lib/streak.ts`)

**Files:**
- Create: `src/lib/streak.ts`
- Test: `src/lib/streak.test.ts`

**Interfaces:**
- Consumes: 없음 (순수 함수, 외부 타입 의존 없음)
- Produces: `calculateStreak(currentStreak: number, lastCheckIn: string, today: string): number` — Task 10(`useLocalStorage`)에서 사용

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/lib/streak.test.ts
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
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run src/lib/streak.test.ts`
Expected: FAIL — `streak.ts` 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// src/lib/streak.ts
function daysBetween(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T00:00:00Z`).getTime()
  const to = new Date(`${toDate}T00:00:00Z`).getTime()
  return Math.round((to - from) / (1000 * 60 * 60 * 24))
}

export function calculateStreak(
  currentStreak: number,
  lastCheckIn: string,
  today: string,
): number {
  const diff = daysBetween(lastCheckIn, today)

  if (diff <= 0) return currentStreak
  if (diff === 1) return currentStreak + 1
  if (diff === 2) return currentStreak + 1
  return 1
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run src/lib/streak.test.ts`
Expected: PASS (5개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/streak.ts src/lib/streak.test.ts
git commit -m "feat: add streak calculation with 1-day grace rule"
```

---

### Task 4: 난이도 조절 로직 (`lib/difficulty.ts`)

**Files:**
- Create: `src/lib/difficulty.ts`
- Test: `src/lib/difficulty.test.ts`

**Interfaces:**
- Consumes: `DifficultyLevel` from `../../types`
- Produces: `calculateDifficulty(currentLevel: DifficultyLevel, recentResults: boolean[]): DifficultyLevel` — Task 10(`useLocalStorage`)에서 사용. `recentResults`는 최신 항목이 배열 마지막에 오는 순서.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/lib/difficulty.test.ts
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
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run src/lib/difficulty.test.ts`
Expected: FAIL — `difficulty.ts` 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// src/lib/difficulty.ts
import type { DifficultyLevel } from '../../types'

const LEVELS: DifficultyLevel[] = ['기초', '보통', '심화']

export function calculateDifficulty(
  currentLevel: DifficultyLevel,
  recentResults: boolean[],
): DifficultyLevel {
  const lastTwo = recentResults.slice(-2)
  if (lastTwo.length < 2) return currentLevel

  const [first, second] = lastTwo
  const currentIndex = LEVELS.indexOf(currentLevel)

  if (first === false && second === false) {
    return LEVELS[Math.max(currentIndex - 1, 0)]
  }
  if (first === true && second === true) {
    return LEVELS[Math.min(currentIndex + 1, LEVELS.length - 1)]
  }
  return currentLevel
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run src/lib/difficulty.test.ts`
Expected: PASS (6개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/difficulty.ts src/lib/difficulty.test.ts
git commit -m "feat: add difficulty adjustment with 2-in-a-row up/down rule"
```

---

### Task 5: AI 채점 응답 스키마 검증 (`api/_shared/aiResponseSchema.ts`)

**Files:**
- Create: `api/_shared/aiResponseSchema.ts`
- Test: `api/_shared/aiResponseSchema.test.ts`

**Interfaces:**
- Consumes: `AIGradeResponse` from `../../types`
- Produces: `parseGradeResponse(raw: string): AIGradeResponse | null` — Task 8(`submit-answer.ts`)에서 사용

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// api/_shared/aiResponseSchema.test.ts
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
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run api/_shared/aiResponseSchema.test.ts`
Expected: FAIL — 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// api/_shared/aiResponseSchema.ts
import type { AIGradeResponse } from '../../types'

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim()
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/)
  return match ? match[1] : trimmed
}

export function parseGradeResponse(raw: string): AIGradeResponse | null {
  let data: unknown
  try {
    data = JSON.parse(stripCodeFence(raw))
  } catch {
    return null
  }

  if (typeof data !== 'object' || data === null) return null
  const obj = data as Record<string, unknown>

  if (typeof obj.isCorrect !== 'boolean') return null
  if (typeof obj.feedback !== 'string') return null
  if (obj.followUpQuestion !== null && typeof obj.followUpQuestion !== 'string') return null
  if (obj.encouragement !== null && typeof obj.encouragement !== 'string') return null

  return {
    isCorrect: obj.isCorrect,
    feedback: obj.feedback,
    followUpQuestion: (obj.followUpQuestion as string | null) ?? null,
    encouragement: (obj.encouragement as string | null) ?? null,
  }
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run api/_shared/aiResponseSchema.test.ts`
Expected: PASS (6개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add api/_shared/aiResponseSchema.ts api/_shared/aiResponseSchema.test.ts
git commit -m "feat: add AI grading response schema validation"
```

---

### Task 6: OpenRouter 호출 헬퍼 (`api/_shared/openrouter.ts`)

**Files:**
- Create: `api/_shared/openrouter.ts`
- Test: `api/_shared/openrouter.test.ts`

**Interfaces:**
- Consumes: 없음 (환경변수 `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, 전역 `fetch`)
- Produces: `callOpenRouter(messages: ChatMessage[]): Promise<string>`, `OpenRouterError` (class, `status?: number` 프로퍼티 보유) — Task 7, 8에서 사용

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// api/_shared/openrouter.test.ts
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
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run api/_shared/openrouter.test.ts`
Expected: FAIL — 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// api/_shared/openrouter.ts
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
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run api/_shared/openrouter.test.ts`
Expected: PASS (4개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add api/_shared/openrouter.ts api/_shared/openrouter.test.ts
git commit -m "feat: add OpenRouter proxy helper with rate-limit handling"
```

---

### Task 7: 데일리 질문 생성 API (`api/generate-question.ts`)

**Files:**
- Create: `api/generate-question.ts`
- Test: `api/generate-question.test.ts`

**Interfaces:**
- Consumes: `callOpenRouter`, `OpenRouterError` from `./_shared/openrouter`; `GenerateQuestionRequest`, `GenerateQuestionResponse` from `../types`
- Produces: default export `handler(req: VercelRequest, res: VercelResponse)` — POST `{targetJob, focusTopic, difficultyLevel}` → `{question: string}`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// api/generate-question.test.ts
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
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run api/generate-question.test.ts`
Expected: FAIL — 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// api/generate-question.ts
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
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run api/generate-question.test.ts`
Expected: PASS (4개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add api/generate-question.ts api/generate-question.test.ts
git commit -m "feat: add generate-question serverless function"
```

---

### Task 8: 답변 채점 API (`api/submit-answer.ts`)

**Files:**
- Create: `api/submit-answer.ts`
- Test: `api/submit-answer.test.ts`

**Interfaces:**
- Consumes: `callOpenRouter`, `OpenRouterError` from `./_shared/openrouter`; `parseGradeResponse` from `./_shared/aiResponseSchema`; `SubmitAnswerRequest`, `AIGradeResponse` from `../types`
- Produces: default export `handler(req: VercelRequest, res: VercelResponse)` — POST `{question, answer}` → `AIGradeResponse`

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// api/submit-answer.test.ts
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
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run api/submit-answer.test.ts`
Expected: FAIL — 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// api/submit-answer.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { callOpenRouter, OpenRouterError } from './_shared/openrouter'
import { parseGradeResponse } from './_shared/aiResponseSchema'
import type { AIGradeResponse, SubmitAnswerRequest } from '../types'

const SYSTEM_PROMPT = `당신은 실무 시니어 개발자입니다. 지원자의 기술 면접 답변을 채점하세요.
반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 코드 펜스를 포함하지 마세요.
{"isCorrect": boolean, "feedback": string, "followUpQuestion": string | null, "encouragement": string | null}
정답이면 feedback에 피드백을, followUpQuestion에 실무 적용 사례나 심화 개념을 묻는 꼬리질문을 채우고 encouragement는 null로 두세요.
오답이거나 "모르겠다"는 답변이면 feedback에 정답과 해설을, encouragement에 격려 메시지를 채우고 followUpQuestion은 null로 두세요.`

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
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run api/submit-answer.test.ts`
Expected: PASS (6개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add api/submit-answer.ts api/submit-answer.test.ts
git commit -m "feat: add submit-answer serverless function with 1-retry JSON grading"
```

---

### Task 9: Local Storage 접근 계층 (`src/lib/storage.ts`)

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

**Interfaces:**
- Consumes: `AppState`, `HistoryEntry`, `UserProfile` from `../../types`
- Produces: `LoadStateResult` (discriminated union), `loadState(): LoadStateResult`, `saveState(state: AppState): void`, `clearState(): void`, `createInitialState(userProfile: UserProfile, today: string): AppState`, `appendHistoryEntry(state: AppState, entry: HistoryEntry): AppState`, `hasAnsweredToday(state: AppState, today: string): boolean` — Task 10, 11에서 사용

**참고:** design spec 5장의 "Local Storage 손상 데이터는 조용히 초기화하지 않고 사용자에게 알린 뒤 확인받는다"를 만족하기 위해, `loadState`는 "데이터 없음"과 "손상된 데이터"를 구분해서 반환한다.

- [ ] **Step 1: 실패하는 테스트 작성**

```ts
// src/lib/storage.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadState,
  saveState,
  clearState,
  createInitialState,
  appendHistoryEntry,
  hasAnsweredToday,
} from './storage'
import type { UserProfile } from '../../types'

const profile: UserProfile = {
  targetJob: '프론트엔드 개발자',
  focusTopic: '운영체제(OS)',
  difficultyLevel: '보통',
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('loadState', () => {
  it('저장된 값이 없으면 status: empty를 반환한다', () => {
    expect(loadState()).toEqual({ status: 'empty' })
  })

  it('저장된 값이 깨진 JSON이면 status: corrupted를 반환한다', () => {
    window.localStorage.setItem('ai-coaching-mvp:state', '{not valid json')
    expect(loadState()).toEqual({ status: 'corrupted' })
  })

  it('필수 필드가 없는 값이면 status: corrupted를 반환한다', () => {
    window.localStorage.setItem('ai-coaching-mvp:state', JSON.stringify({ foo: 'bar' }))
    expect(loadState()).toEqual({ status: 'corrupted' })
  })

  it('saveState로 저장한 값을 status: ok로 그대로 불러온다', () => {
    const state = createInitialState(profile, '2026-08-23')
    saveState(state)
    expect(loadState()).toEqual({ status: 'ok', state })
  })
})

describe('clearState', () => {
  it('저장된 값을 지우면 다시 status: empty가 된다', () => {
    saveState(createInitialState(profile, '2026-08-23'))
    clearState()
    expect(loadState()).toEqual({ status: 'empty' })
  })
})

describe('appendHistoryEntry', () => {
  it('원본 state를 변경하지 않고 새 history를 추가한 state를 반환한다', () => {
    const state = createInitialState(profile, '2026-08-23')
    const entry = { date: '2026-08-23', question: 'Q', isCorrect: true, feedback: 'F' }
    const next = appendHistoryEntry(state, entry)
    expect(state.history).toHaveLength(0)
    expect(next.history).toEqual([entry])
  })
})

describe('hasAnsweredToday', () => {
  it('오늘 날짜의 history 항목이 있으면 true를 반환한다', () => {
    const state = appendHistoryEntry(createInitialState(profile, '2026-08-23'), {
      date: '2026-08-23',
      question: 'Q',
      isCorrect: true,
      feedback: 'F',
    })
    expect(hasAnsweredToday(state, '2026-08-23')).toBe(true)
  })

  it('오늘 날짜의 history 항목이 없으면 false를 반환한다', () => {
    const state = createInitialState(profile, '2026-08-23')
    expect(hasAnsweredToday(state, '2026-08-23')).toBe(false)
  })
})
```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: FAIL — 모듈이 없어서 에러

- [ ] **Step 3: 최소 구현 작성**

```ts
// src/lib/storage.ts
import type { AppState, HistoryEntry, UserProfile } from '../../types'

const STORAGE_KEY = 'ai-coaching-mvp:state'

export type LoadStateResult =
  | { status: 'empty' }
  | { status: 'corrupted' }
  | { status: 'ok'; state: AppState }

export function loadState(): LoadStateResult {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return { status: 'empty' }

  try {
    const parsed = JSON.parse(raw) as AppState
    if (
      !parsed.userProfile ||
      typeof parsed.streak !== 'number' ||
      typeof parsed.lastCheckIn !== 'string' ||
      !Array.isArray(parsed.history)
    ) {
      return { status: 'corrupted' }
    }
    return { status: 'ok', state: parsed }
  } catch {
    return { status: 'corrupted' }
  }
}

export function saveState(state: AppState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearState(): void {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function createInitialState(userProfile: UserProfile, today: string): AppState {
  return {
    userProfile,
    streak: 0,
    lastCheckIn: today,
    history: [],
  }
}

export function appendHistoryEntry(state: AppState, entry: HistoryEntry): AppState {
  return {
    ...state,
    history: [...state.history, entry],
  }
}

export function hasAnsweredToday(state: AppState, today: string): boolean {
  return state.history.some((entry) => entry.date === today)
}
```

- [ ] **Step 4: 테스트 실행 → 통과 확인**

Run: `npx vitest run src/lib/storage.test.ts`
Expected: PASS (8개 테스트 모두 통과)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: add Local Storage access layer with corrupted-data guard"
```

---

### Task 10: 앱 상태 훅 (`src/hooks/useLocalStorage.ts`)

**Files:**
- Create: `src/hooks/useLocalStorage.ts`

**Interfaces:**
- Consumes: `loadState`, `saveState`, `clearState`, `createInitialState`, `appendHistoryEntry` from `../lib/storage`; `calculateStreak` from `../lib/streak`; `calculateDifficulty` from `../lib/difficulty`; `AppState`, `HistoryEntry`, `UserProfile` from `../../types`
- Produces: `useLocalStorage(): { state: AppState | null; isCorrupted: boolean; resetCorrupted: () => void; completeOnboarding: (profile: UserProfile) => void; recordAnswer: (question: string, isCorrect: boolean, feedback: string) => void }` — Task 15(`App.tsx`)에서 사용

**참고:** 이 태스크는 React 훅이라 design spec 6장에 따라 자동화 테스트를 작성하지 않는다. 대신 마지막 Step에서 임시 테스트 컴포넌트로 수동 검증한다. `isCorrupted`/`resetCorrupted`는 Local Storage 손상 데이터를 조용히 지우지 않고 사용자 확인을 받기 위한 필드다.

- [ ] **Step 1: 구현 작성**

```ts
// src/hooks/useLocalStorage.ts
import { useCallback, useState } from 'react'
import type { AppState, HistoryEntry, UserProfile } from '../../types'
import { appendHistoryEntry, clearState, createInitialState, loadState, saveState } from '../lib/storage'
import { calculateDifficulty } from '../lib/difficulty'
import { calculateStreak } from '../lib/streak'

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useLocalStorage() {
  const initialResult = loadState()
  const [state, setState] = useState<AppState | null>(
    initialResult.status === 'ok' ? initialResult.state : null,
  )
  const [isCorrupted, setIsCorrupted] = useState(initialResult.status === 'corrupted')

  const resetCorrupted = useCallback(() => {
    clearState()
    setIsCorrupted(false)
    setState(null)
  }, [])

  const completeOnboarding = useCallback((profile: UserProfile) => {
    const initial = createInitialState(profile, todayString())
    saveState(initial)
    setState(initial)
  }, [])

  const recordAnswer = useCallback((question: string, isCorrect: boolean, feedback: string) => {
    setState((prev) => {
      if (!prev) return prev

      const today = todayString()
      const entry: HistoryEntry = { date: today, question, isCorrect, feedback }
      const withHistory = appendHistoryEntry(prev, entry)
      const newStreak = calculateStreak(prev.streak, prev.lastCheckIn, today)
      const recentResults = withHistory.history.slice(-2).map((h) => h.isCorrect)
      const newDifficulty = calculateDifficulty(prev.userProfile.difficultyLevel, recentResults)

      const next: AppState = {
        ...withHistory,
        streak: newStreak,
        lastCheckIn: today,
        userProfile: { ...prev.userProfile, difficultyLevel: newDifficulty },
      }

      saveState(next)
      return next
    })
  }, [])

  return { state, isCorrupted, resetCorrupted, completeOnboarding, recordAnswer }
}
```

- [ ] **Step 2: 타입체크 검증**

Run: `npm run build`
Expected: 종료 코드 0

- [ ] **Step 3: 커밋**

```bash
git add src/hooks/useLocalStorage.ts
git commit -m "feat: add useLocalStorage hook wiring storage/streak/difficulty"
```

---

### Task 11: 데일리 질문 훅 (`src/hooks/useDailyQuestion.ts`)

**Files:**
- Create: `src/hooks/useDailyQuestion.ts`

**Interfaces:**
- Consumes: `hasAnsweredToday` from `../lib/storage`; `AppState`, `GenerateQuestionResponse` from `../../types`
- Produces: `useDailyQuestion(state: AppState | null): { question: string | null; loading: boolean; error: string | null; fetchQuestion: () => Promise<void>; alreadyAnsweredToday: boolean }` — Task 15(`App.tsx`)에서 사용

- [ ] **Step 1: 구현 작성**

```ts
// src/hooks/useDailyQuestion.ts
import { useCallback, useState } from 'react'
import type { AppState, GenerateQuestionResponse } from '../../types'
import { hasAnsweredToday } from '../lib/storage'

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

export function useDailyQuestion(state: AppState | null) {
  const [question, setQuestion] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestion = useCallback(async () => {
    if (!state) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetJob: state.userProfile.targetJob,
          focusTopic: state.userProfile.focusTopic,
          difficultyLevel: state.userProfile.difficultyLevel,
        }),
      })
      if (!res.ok) throw new Error('질문을 불러오지 못했습니다.')
      const data = (await res.json()) as GenerateQuestionResponse
      setQuestion(data.question)
    } catch {
      setError('질문을 불러오지 못했어요. 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }, [state])

  const alreadyAnsweredToday = state ? hasAnsweredToday(state, todayString()) : false

  return { question, loading, error, fetchQuestion, alreadyAnsweredToday }
}
```

- [ ] **Step 2: 타입체크 검증**

Run: `npm run build`
Expected: 종료 코드 0

- [ ] **Step 3: 커밋**

```bash
git add src/hooks/useDailyQuestion.ts
git commit -m "feat: add useDailyQuestion hook"
```

---

### Task 12: 답변 제출 훅 (`src/hooks/useSubmitAnswer.ts`)

**Files:**
- Create: `src/hooks/useSubmitAnswer.ts`

**Interfaces:**
- Consumes: `AIGradeResponse` from `../../types`
- Produces: `useSubmitAnswer(): { result: AIGradeResponse | null; loading: boolean; error: string | null; submitAnswer: (question: string, answer: string) => Promise<AIGradeResponse | null> }` — Task 15(`App.tsx`)에서 사용

- [ ] **Step 1: 구현 작성**

```ts
// src/hooks/useSubmitAnswer.ts
import { useCallback, useState } from 'react'
import type { AIGradeResponse } from '../../types'

export function useSubmitAnswer() {
  const [result, setResult] = useState<AIGradeResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitAnswer = useCallback(async (question: string, answer: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer }),
      })
      if (!res.ok) throw new Error('채점에 실패했습니다.')
      const data = (await res.json()) as AIGradeResponse
      setResult(data)
      return data
    } catch {
      setError('답변을 채점하지 못했어요. 다시 시도해주세요.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { result, loading, error, submitAnswer }
}
```

- [ ] **Step 2: 타입체크 검증**

Run: `npm run build`
Expected: 종료 코드 0

- [ ] **Step 3: 커밋**

```bash
git add src/hooks/useSubmitAnswer.ts
git commit -m "feat: add useSubmitAnswer hook"
```

---

### Task 13: 온보딩 화면 (`src/components/OnboardingForm.tsx`)

**Files:**
- Create: `src/components/OnboardingForm.tsx`

**Interfaces:**
- Produces: `OnboardingForm({ onSubmit }: { onSubmit: (targetJob: string, focusTopic: string) => void })` — Task 15(`App.tsx`)에서 사용

- [ ] **Step 1: 구현 작성**

```tsx
// src/components/OnboardingForm.tsx
import { useState, type FormEvent } from 'react'

const TARGET_JOBS = ['프론트엔드 개발자', '백엔드 개발자', 'iOS 개발자', 'Android 개발자']
const FOCUS_TOPICS = ['운영체제(OS)', '네트워크', '자료구조', '데이터베이스', '알고리즘']

interface OnboardingFormProps {
  onSubmit: (targetJob: string, focusTopic: string) => void
}

export function OnboardingForm({ onSubmit }: OnboardingFormProps) {
  const [targetJob, setTargetJob] = useState(TARGET_JOBS[0])
  const [focusTopic, setFocusTopic] = useState(FOCUS_TOPICS[0])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(targetJob, focusTopic)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mt-20 max-w-sm space-y-4 rounded-lg bg-white p-6 shadow"
    >
      <h1 className="text-xl font-bold text-slate-800">시작하기 전에</h1>

      <label className="block">
        <span className="text-sm text-slate-600">목표 직무</span>
        <select
          value={targetJob}
          onChange={(e) => setTargetJob(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 p-2"
        >
          {TARGET_JOBS.map((job) => (
            <option key={job} value={job}>
              {job}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-sm text-slate-600">이번 주 집중 카테고리</span>
        <select
          value={focusTopic}
          onChange={(e) => setFocusTopic(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 p-2"
        >
          {FOCUS_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {topic}
            </option>
          ))}
        </select>
      </label>

      <button type="submit" className="w-full rounded bg-slate-800 py-2 font-medium text-white">
        시작하기
      </button>
    </form>
  )
}
```

- [ ] **Step 2: 타입체크 검증**

Run: `npm run build`
Expected: 종료 코드 0

- [ ] **Step 3: 커밋**

```bash
git add src/components/OnboardingForm.tsx
git commit -m "feat: add onboarding form component"
```

---

### Task 14: 채팅 UI 컴포넌트 (StreakHeader, MessageBubble, ChatWindow)

**Files:**
- Create: `src/components/StreakHeader.tsx`
- Create: `src/components/MessageBubble.tsx`
- Create: `src/components/ChatWindow.tsx`

**Interfaces:**
- Produces: `StreakHeader({ streak: number })`; `MessageBubble({ role: 'question' | 'answer' | 'feedback', text: string })`; `ChatWindow({ messages: ChatMessageItem[], onSendAnswer: (answer: string) => void, disabled: boolean })` and exported type `ChatMessageItem` — Task 15(`App.tsx`)에서 사용

- [ ] **Step 1: StreakHeader 구현**

```tsx
// src/components/StreakHeader.tsx
const TOTAL_CELLS = 14

interface StreakHeaderProps {
  streak: number
}

export function StreakHeader({ streak }: StreakHeaderProps) {
  const filledCount = Math.min(streak, TOTAL_CELLS)
  const cells = Array.from({ length: TOTAL_CELLS }, (_, i) => i < filledCount)

  return (
    <div className="flex items-center gap-3 border-b border-slate-200 p-4">
      <span className="text-sm font-medium text-slate-600">🔥 {streak}일 연속</span>
      <div className="flex gap-1">
        {cells.map((filled, i) => (
          <span
            key={i}
            className={`h-3 w-3 rounded-sm ${filled ? 'bg-green-500' : 'bg-slate-200'}`}
          />
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: MessageBubble 구현**

```tsx
// src/components/MessageBubble.tsx
interface MessageBubbleProps {
  role: 'question' | 'answer' | 'feedback'
  text: string
}

export function MessageBubble({ role, text }: MessageBubbleProps) {
  const isUser = role === 'answer'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-lg px-4 py-2 ${
          isUser ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        {text}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: ChatWindow 구현**

```tsx
// src/components/ChatWindow.tsx
import { useState, type FormEvent } from 'react'
import { MessageBubble } from './MessageBubble'

export interface ChatMessageItem {
  role: 'question' | 'answer' | 'feedback'
  text: string
}

interface ChatWindowProps {
  messages: ChatMessageItem[]
  onSendAnswer: (answer: string) => void
  disabled: boolean
}

export function ChatWindow({ messages, onSendAnswer, disabled }: ChatWindowProps) {
  const [input, setInput] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    onSendAnswer(input.trim())
    setInput('')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} />
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={disabled}
          placeholder="답변을 입력하세요"
          className="flex-1 rounded border border-slate-300 px-3 py-2 disabled:bg-slate-100"
        />
        <button
          type="submit"
          disabled={disabled}
          className="rounded bg-slate-800 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: 타입체크 검증**

Run: `npm run build`
Expected: 종료 코드 0

- [ ] **Step 5: 커밋**

```bash
git add src/components/StreakHeader.tsx src/components/MessageBubble.tsx src/components/ChatWindow.tsx
git commit -m "feat: add streak header and chat UI components"
```

---

### Task 15: App.tsx 최종 통합

**Files:**
- Modify: `src/App.tsx` (Task 1의 임시 구현을 교체)

**Interfaces:**
- Consumes: `useLocalStorage`, `useDailyQuestion`, `useSubmitAnswer`, `OnboardingForm`, `StreakHeader`, `ChatWindow`(+`ChatMessageItem`) — 모두 이전 태스크에서 정의한 그대로의 이름/시그니처 사용

- [ ] **Step 1: App.tsx 전체 교체**

```tsx
// src/App.tsx
import { useEffect, useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useDailyQuestion } from './hooks/useDailyQuestion'
import { useSubmitAnswer } from './hooks/useSubmitAnswer'
import { OnboardingForm } from './components/OnboardingForm'
import { StreakHeader } from './components/StreakHeader'
import { ChatWindow, type ChatMessageItem } from './components/ChatWindow'

function App() {
  const { state, isCorrupted, resetCorrupted, completeOnboarding, recordAnswer } = useLocalStorage()
  const {
    question,
    loading: questionLoading,
    error: questionError,
    fetchQuestion,
    alreadyAnsweredToday,
  } = useDailyQuestion(state)
  const { loading: gradingLoading, error: gradingError, submitAnswer } = useSubmitAnswer()
  const [messages, setMessages] = useState<ChatMessageItem[]>([])

  useEffect(() => {
    if (state && !alreadyAnsweredToday && !question) {
      fetchQuestion()
    }
  }, [state, alreadyAnsweredToday, question, fetchQuestion])

  useEffect(() => {
    if (question) {
      setMessages([{ role: 'question', text: question }])
    }
  }, [question])

  if (isCorrupted) {
    return (
      <div className="mx-auto mt-20 max-w-sm space-y-4 rounded-lg bg-white p-6 text-center shadow">
        <p className="text-slate-700">저장된 데이터를 읽을 수 없어요. 초기화하고 다시 시작할까요?</p>
        <button
          onClick={resetCorrupted}
          className="w-full rounded bg-slate-800 py-2 font-medium text-white"
        >
          초기화하고 다시 시작하기
        </button>
      </div>
    )
  }

  if (!state) {
    return (
      <OnboardingForm
        onSubmit={(targetJob, focusTopic) =>
          completeOnboarding({ targetJob, focusTopic, difficultyLevel: '보통' })
        }
      />
    )
  }

  async function handleSendAnswer(answer: string) {
    if (!question) return
    setMessages((prev) => [...prev, { role: 'answer', text: answer }])
    const result = await submitAnswer(question, answer)
    if (!result) return
    const feedbackText = [result.feedback, result.followUpQuestion, result.encouragement]
      .filter((v): v is string => Boolean(v))
      .join('\n\n')
    setMessages((prev) => [...prev, { role: 'feedback', text: feedbackText }])
    recordAnswer(question, result.isCorrect, result.feedback)
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <StreakHeader streak={state.streak} />
      <div className="flex-1 overflow-hidden">
        {alreadyAnsweredToday ? (
          <p className="p-4 text-slate-500">오늘의 미션을 이미 완료했어요. 내일 다시 만나요!</p>
        ) : questionLoading ? (
          <p className="p-4 text-slate-500">질문을 불러오는 중...</p>
        ) : questionError ? (
          <div className="space-y-2 p-4">
            <p className="text-red-500">{questionError}</p>
            <button onClick={fetchQuestion} className="rounded bg-slate-800 px-4 py-2 text-white">
              다시 시도
            </button>
          </div>
        ) : (
          <ChatWindow messages={messages} onSendAnswer={handleSendAnswer} disabled={gradingLoading} />
        )}
      </div>
      {gradingError && <p className="p-2 text-center text-red-500">{gradingError}</p>}
    </div>
  )
}

export default App
```

- [ ] **Step 2: 빌드 및 전체 테스트 검증**

Run: `npm run build`
Expected: 종료 코드 0

Run: `npm test`
Expected: 이전 태스크에서 작성한 모든 단위 테스트(streak, difficulty, storage, aiResponseSchema, openrouter, generate-question, submit-answer) 통과

- [ ] **Step 3: 수동 검증**

Run: `npm run dev`

1. 브라우저에서 온보딩 화면이 뜨는지 확인 (목표 직무/집중 카테고리 select + 시작하기 버튼)
2. "시작하기" 클릭 → 메인 화면 전환 확인 (StreakHeader에 "🔥 0일 연속" 표시)
3. `.env.local`에 `OPENROUTER_API_KEY`/`OPENROUTER_MODEL`이 없다면 질문 로딩이 실패 메시지 + "다시 시도" 버튼으로 이어지는지 확인
4. 실제 키가 있다면: 질문이 채팅창에 표시되는지, 답변 입력 후 전송 시 피드백/꼬리질문(또는 격려 메시지)이 채팅에 추가되고 스트릭이 갱신되는지 확인
5. 브라우저를 새로고침해도 온보딩을 다시 요구하지 않고 기존 상태가 유지되는지 확인 (Local Storage 영속성)
6. 브라우저 개발자도구 콘솔에서 `localStorage.setItem('ai-coaching-mvp:state', '{broken')` 실행 후 새로고침 → "저장된 데이터를 읽을 수 없어요" 화면이 뜨는지, "초기화하고 다시 시작하기" 클릭 시 온보딩 화면으로 정상 복귀하는지 확인

- [ ] **Step 4: 커밋**

```bash
git add src/App.tsx
git commit -m "feat: wire onboarding, daily question, and chat flow in App"
```

---

### Task 16: 문서화 및 최종 점검

**Files:**
- Create: `README.md`

**Interfaces:**
- 없음 (문서 태스크)

- [ ] **Step 1: README.md 작성**

```markdown
# IT 기술면접 데일리 AI 코칭 서비스 (MVP)

## 설정

1. `npm install`
2. `.env.example`을 `.env.local`로 복사하고 값 채우기
   - `OPENROUTER_API_KEY`: OpenRouter API 키
   - `OPENROUTER_MODEL`: 사용할 무료(`:free`) 모델 ID ([OpenRouter 무료 모델 목록](https://openrouter.ai/models?max_price=0)에서 확인)
3. `npm run dev`로 로컬 개발 서버 실행 (Vite dev 서버는 `/api` 라우트를 프록시하지 않으므로, `/api` 포함 전체 플로우를 테스트하려면 `vercel dev` 사용을 권장합니다)

## 스크립트

- `npm run dev`: 프론트엔드 개발 서버
- `npm run build`: 타입체크 + 프로덕션 빌드
- `npm test`: 단위 테스트 (`src/lib`, `api/_shared` 등 순수 함수)

## 배포

Vercel에 연결하고 `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` 환경변수를 프로젝트 설정에 등록하면 `/api` 함수가 자동으로 Serverless Function으로 배포됩니다.

## 문서

- 기능 명세: [`PRD.md`](./PRD.md)
- 작업 규칙: [`CLAUDE.md`](./CLAUDE.md)
- 설계: [`docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md`](./docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md)
```

- [ ] **Step 2: 최종 전체 검증**

Run: `npm run build`
Expected: 종료 코드 0

Run: `npm test`
Expected: 모든 단위 테스트 통과

- [ ] **Step 3: 커밋**

```bash
git add README.md
git commit -m "docs: add project README"
```
