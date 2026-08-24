# IT 기술면접 데일리 AI 코칭 서비스 (MVP) — 초기 스캐폴딩 설계

- 관련 문서: `PRD.md`, `CLAUDE.md`
- 작성일: 2026-08-24
- 범위: 프로젝트 초기 구조/스택 세팅 및 F1~F5 구현을 위한 아키텍처 설계 (architectural path)

## 1. 배경

`PRD.md`에 정의된 기능(F1 온보딩, F2 데일리 질문 생성, F3 채팅 UI, F4 AI 피드백/채점, F5 스트릭)을 구현하기 위한 프로젝트 초기 구조를 설계한다. 기술 스택(React SPA + Vercel Serverless Function + Local Storage + OpenRouter 무료 모델)과 채점/스트릭 정책은 이미 `PRD.md`/`CLAUDE.md`에 확정되어 있으며, 이 문서는 그 위에서 구현 세부 구조를 다룬다.

## 2. 구현 스택 결정

| 항목 | 결정 |
|---|---|
| 언어 | TypeScript |
| 빌드 도구 | Vite (React + TS 템플릿) |
| 스타일링 | Tailwind CSS |
| 패키지 매니저 | npm |
| 테스트 | Vitest — `lib/` 순수 함수(스트릭, 난이도, JSON 파싱/검증)만 단위 테스트. 컴포넌트/E2E 테스트는 MVP 범위 제외 |
| 배포 | Vercel (정적 프론트엔드 + `/api` Serverless Functions) |

## 3. 프로젝트 구조

```
/src
  /components   (OnboardingForm, StreakHeader, ChatWindow, MessageBubble)
  /hooks        (useLocalStorage, useDailyQuestion, useSubmitAnswer)
  /lib          (streak.ts, difficulty.ts, storage.ts — 순수 함수, 단위 테스트 대상)
  /types        (userProfile, history, AI 응답 스키마)
  App.tsx
/api
  generate-question.ts     (Vercel Serverless Function)
  submit-answer.ts         (Vercel Serverless Function)
  _shared/openrouter.ts    (OpenRouter 호출 공통 헬퍼)
```

- **라우터 불필요**: 화면은 사실상 하나. `App.tsx`가 Local Storage의 `userProfile` 존재 여부로 온보딩 화면 ↔ 메인 채팅 화면을 조건부 렌더링.
- **API 2개로 분리**: `generate-question`(질문 생성 프롬프트)과 `submit-answer`(채점+피드백 프롬프트)는 목적이 달라 분리. OpenRouter 호출/에러 처리 로직은 `_shared/openrouter.ts`로 공통화.
- **`lib/`가 핵심 로직 위치**: 스트릭 계산, 난이도 조절, AI JSON 응답 파싱/검증을 컴포넌트와 독립된 순수 함수로 분리.

## 4. 데이터 흐름

1. 앱 로드 → `useLocalStorage`로 `userProfile` 존재 여부 확인
2. 없으면 `OnboardingForm` 표시 → 제출 시 `userProfile` 저장(목표 직무, 집중 카테고리), 메인 화면 전환 (F1)
3. 메인 화면 진입 시 `useDailyQuestion`이 오늘 이미 질문을 받았는지(`history`에 오늘 날짜 항목 존재 여부) 확인 → 없으면 `/api/generate-question` 호출. 난이도는 `lib/difficulty.ts`가 최근 history를 기반으로 클라이언트에서 계산해 요청에 포함 (F2)
4. 질문을 채팅 UI에 표시 → 유저가 키워드 중심 서술형 답변 입력 (F3)
5. `useSubmitAnswer`가 `/api/submit-answer` 호출 (질문 + 유저 답변 전달)
6. 서버가 단일 LLM 호출로 구조화된 JSON 응답을 받아 반환:
   ```json
   {
     "isCorrect": true,
     "feedback": "...",
     "followUpQuestion": "...",
     "encouragement": null
   }
   ```
7. 클라이언트가 응답을 `history`에 기록 + `lib/streak.ts`로 스트릭 갱신 → Local Storage 저장 → UI에 피드백/꼬리질문 렌더링 (F4, F5)

## 5. 에러 처리

- **API 호출 실패(네트워크/429 rate limit)**: 채팅창에 실패 메시지 + 재시도 버튼 표시. 자동 재시도는 최대 1회, 이후는 사용자가 직접 버튼을 눌러야 함 (무한 재시도 금지)
- **`submit-answer` JSON 파싱 실패**: 서버 함수 내에서 1회 재요청. 그래도 실패하면 클라이언트에 명확한 실패 상태를 반환하고, `isCorrect`를 임의로 추정하지 않음
- **Local Storage 파싱 실패(손상된 데이터)**: 조용히 초기화하지 않고, 사용자에게 알린 뒤 수동 초기화 여부를 확인받음

## 6. 테스트 전략

Vitest로 `lib/` 아래 순수 함수만 단위 테스트:

- `streak.ts`: 날짜 차이 0/1/2/3일 이상 케이스 (1일 유예 규칙)
- `difficulty.ts`: 2일 연속 오답 시 난이도 하향 등 규칙
- JSON 응답 파싱/검증 유틸: 정상/깨진 JSON 케이스

컴포넌트 테스트, E2E 테스트는 MVP 범위에서 제외한다.

## 7. 범위 밖 (Out of Scope, 이번 스캐폴딩에 포함하지 않음)

- 데이터 백업/복원 기능 (추후 논의 예정 — `PRD.md` 5-1 참고)
- 회원가입/로그인, 서버 DB
- 구체적으로 사용할 OpenRouter 무료 모델명 확정 (구현 시점에 결정)
