# 잇터뷰 (Itterview) — IT 기술면접 데일리 AI 코칭 서비스 (MVP)

> 취업 준비생이 매일 접속해 AI가 출제하는 기술 면접 질문에 답하고, 실무 개발자 페르소나의 피드백을 받으며, 정답률에 따라 난이도가 자동 조절되고 스트릭이 쌓이는 채팅형 웹 서비스입니다.
>
> 이름은 가칭입니다 — 위 제목 한 줄만 바꾸면 되니 원하는 이름이 있으면 언제든 교체하세요.

## 핵심 기능

- **매일 1문제**: 접속 시 AI(OpenRouter)가 직무·주제·현재 난이도에 맞춰 기술 면접 질문을 1개 출제
- **자동 난이도 조절**: 최근 정답 이력을 기반으로 `기초`/`보통`/`심화` 3단계를 클라이언트가 계산 (2일 연속 정답 시 상향, 2일 연속 오답 시 하향)
- **시니어 개발자 페르소나 피드백**: 정답 시 피드백 + 심화 꼬리질문, 오답/모르겠음 시 해설 + 격려 메시지 — 채점과 피드백을 LLM 1회 호출로 처리
- **스트릭**: `lastCheckIn` 기준 하루 결석까지는 유예, 이틀 이상 결석 시 리셋
- **Local Storage 백업/복원**: 서버 DB 없이 브라우저에만 저장되는 구조라, JSON 파일로 내보내기/가져오기 가능 (기기 변경·브라우저 초기화 대비)

## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | React 18 + TypeScript (SPA), Tailwind CSS, Vite |
| Backend | Node.js — Vercel Serverless Function 2개 (`api/generate-question.ts`, `api/submit-answer.ts`). OpenRouter API 키를 숨기는 프록시 역할만 수행 |
| Database | 없음 — 브라우저 Local Storage로 상태 관리 (MVP) |
| AI | OpenRouter API, 무료(`:free`) 모델 — 모델명은 하드코딩하지 않고 환경변수(`OPENROUTER_MODEL`)로 관리 |
| Test | Vitest (`src/lib`, `api/_shared`, API 라우트 핸들러) |

## 폴더 구조

```
src/
  components/    # OnboardingForm, ChatWindow, StreakHeader, BackupControls 등
  hooks/         # useLocalStorage, useDailyQuestion, useSubmitAnswer
  lib/           # storage, streak, difficulty, date — 순수 함수 (테스트 대상)
  App.tsx
api/
  generate-question.ts   # 질문 생성 프록시
  submit-answer.ts       # 채점+피드백 프록시
  _shared/
    openrouter.ts        # OpenRouter 호출 공통 헬퍼
    aiResponseSchema.ts  # 구조화 JSON 응답 파싱/검증
```

## 설정

1. `npm install`
2. `.env.example`을 `.env.local`로 복사하고 값 채우기
   - `OPENROUTER_API_KEY`: OpenRouter API 키
   - `OPENROUTER_MODEL`: 사용할 무료(`:free`) 모델 ID (현재 기본값: `google/gemma-2-9b-it:free`)
3. `npm run dev`로 로컬 개발 서버 실행 (Vite dev 서버는 `/api` 라우트를 프록시하지 않으므로, `/api` 포함 전체 플로우를 테스트하려면 `vercel dev` 사용을 권장합니다)

## 스크립트

- `npm run dev`: 프론트엔드 개발 서버
- `npm run build`: 타입체크 + 프로덕션 빌드
- `npm test`: 단위 테스트 (`src/lib`, `api/_shared`, API 라우트 핸들러)

## 배포

Vercel에 연결하고 `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` 환경변수를 프로젝트 설정에 등록하면 `/api` 함수가 자동으로 Serverless Function으로 배포됩니다.

## 문서

- 기능 명세: [`PRD.md`](./PRD.md)
- 작업 규칙: [`CLAUDE.md`](./CLAUDE.md)
- 설계: [`docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md`](./docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md)
