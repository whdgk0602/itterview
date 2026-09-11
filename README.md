# 잇터뷰 (Itterview) — IT 기술면접 데일리 AI 코칭 서비스 (MVP)

> 취업 준비생이 매일 접속해 AI가 출제하는 기술 면접 질문에 답하고, 실무 개발자 페르소나의 피드백을 받으며, 정답률에 따라 난이도가 자동 조절되고 스트릭이 쌓이는 채팅형 웹 서비스입니다.

배포: https://itterview.vercel.app/

## 프로젝트 개요

- **대상**: IT 개발 직군 취업 준비생
- **핵심 가치**: 마찰 없는 데일리 체크인, 실전 면접 수준의 피드백, 스트릭 보호를 위한 난이도 자동 조절
- **MVP 원칙**: 회원가입/로그인/실제 DB 없이 브라우저 Local Storage만으로 상태를 관리하고, AI 호출은 OpenRouter 무료 모델을 Vercel Serverless Function으로만 프록시합니다 (자세한 배경은 [`CLAUDE.md`](./CLAUDE.md) 참고).

## 어떻게 작동하나요

1. 최초 접속 시 온보딩에서 목표 직무 / 이번 주 집중 카테고리를 선택하면 Local Storage에 프로필이 생성됩니다 (난이도는 `보통`으로 시작).
2. 오늘 아직 답변하지 않았다면 접속 즉시 `POST /api/generate-question`으로 직무·주제·현재 난이도를 서버에 전달하고, 서버는 OpenRouter(무료 모델)에 질문 생성을 요청해 채팅창 첫 메시지로 보여줍니다.
3. 사용자가 답변을 입력하면 `POST /api/submit-answer`로 질문+답변을 전송합니다. 서버는 "시니어 개발자 면접관" 페르소나 프롬프트로 채점과 피드백을 **한 번의 LLM 호출**로 요청하고, 구조화된 JSON(`isCorrect`, `feedback`, `followUpQuestion`, `encouragement`)으로 응답받습니다. JSON 파싱에 실패하면 1회 자동 재시도합니다.
4. 정답이면 초록(에메랄드) 톤 피드백 + 심화 꼬리질문을, 오답/모르겠음이면 주황(앰버) 톤 피드백(해설) + 격려 메시지를 채팅에 표시합니다.
5. 답변 결과는 `history`에 기록되고, `lastCheckIn`과 오늘 날짜 차이로 스트릭을 재계산하며, 최근 2회 정답/오답 결과로 난이도를 자동 조정합니다 — 모두 Local Storage에 즉시 저장됩니다.
6. 다음날 다시 접속하면 갱신된 난이도로 새 질문이 출제되고, 헤더의 스트릭 그리드에 전날 결과가 새 칸으로 반영됩니다.

## 주요 기능

### 1. 온보딩 화면
- 목표 직무(프론트엔드/백엔드/iOS/Android)와 이번 주 집중 카테고리(OS·네트워크·자료구조·DB·알고리즘)를 선택합니다.
- 최초 1회만 노출되며, 제출 시 Local Storage에 프로필을 생성합니다 (난이도 기본값 `보통`).
- 화면 하단에 "백업 불러오기" 링크가 있어 다른 기기/브라우저에서 내보낸 백업 JSON으로 바로 복원할 수 있습니다.

### 2. 메인 화면 헤더 — 스트릭 · 난이도 · 설정
- 🔥 연속 출석일수와 현재 난이도 배지(기초=회색 / 보통=인디고 / 심화=로즈)를 보여줍니다.
- 최근 4주(7×4)를 GitHub 잔디 스타일 그리드로 표시합니다 — 초록(정답)/주황(오답)/회색(미응시), 칸에 마우스를 올리면 날짜와 정답 여부 툴팁이 뜹니다.
- 우측 ⚙️ 아이콘을 누르면 백업 저장/불러오기 팝오버가 열립니다 (저장은 프로필이 있을 때만 노출).

### 3. 채팅형 질문/답변
- 접속 시 자동으로 질문 1개를 불러오고, 로딩 중엔 카드형 안내 문구를 보여줍니다.
- 질문(흰 배경, "면접관" 라벨) / 내 답변(인디고 배경, 우측 정렬, "나" 라벨) / 피드백(정답=에메랄드, 오답=앰버, "코치" 라벨)로 발신자별 색상과 정렬을 구분합니다.
- 오늘 이미 답변을 완료했다면 초록 카드로 "오늘의 미션을 이미 완료했어요"를 안내합니다.

### 4. 오류 / 한도 초과 UX
- 질문 생성에 실패하면 빨간 카드와 "다시 시도" 버튼을 보여줍니다.
- 채점에 실패하면 하단에 오류 메시지를 표시하고, 답변을 재입력해 재시도할 수 있습니다.
- OpenRouter 429(요청 한도 초과) 등 실제 서버 오류 메시지를 그대로 노출합니다 — 실패를 조용히 삼키거나 무한 재시도하지 않습니다.

### 5. 데이터 백업/복원
- Local Storage 상태를 JSON 파일로 내보낼 수 있습니다 (`ai-coaching-backup-YYYY-MM-DD.json`).
- 온보딩 화면 / 손상 데이터 복구 화면 / 메인 화면(⚙️ 팝오버) 어디서든 백업 파일을 가져올 수 있습니다.
- 저장된 데이터가 손상되어 파싱할 수 없으면 자동으로 감지해 초기화 또는 백업 복원 화면을 보여줍니다.

## 서비스에 필요한 추가 설명

- **OpenRouter API 키 발급**: https://openrouter.ai 가입 후 Keys 메뉴에서 키를 발급받아 `OPENROUTER_API_KEY`에 등록해야 실제 질문 생성/채점이 동작합니다. 키가 없으면 서버가 즉시 명확한 에러를 반환합니다(크래시가 아닙니다).
- **무료 모델 이름은 자주 바뀝니다**: `OPENROUTER_MODEL`은 하드코딩하지 않고 환경변수로만 관리합니다. 특정 모델이 단종되거나 특정 제공사(provider) 라우팅이 막히면 https://openrouter.ai/models?max_price=0 에서 다른 `:free` 모델로 교체하세요. 교체 이력은 [`PRD.md`](./PRD.md)의 "정책 결정 사항" 표에서 확인할 수 있습니다.
- **무료 모델의 일일/분당 한도**: OpenRouter는 계정에 크레딧을 한 번도 구매하지 않았다면 무료 모델 요청이 하루 50회(분당 20회)로 제한되고, 크레딧을 10달러 이상 구매하면 하루 1000회로 늘어납니다. 테스트를 반복하다 429가 계속 뜨면 이 한도 때문일 수 있습니다 — https://openrouter.ai/settings/credits 에서 잔여 크레딧/구매 이력을 확인하세요.
- **Vercel 환경변수는 재배포해야 반영됩니다**: Vercel 프로젝트 Settings → Environment Variables에서 `OPENROUTER_API_KEY`/`OPENROUTER_MODEL`을 바꾼 뒤에는 반드시 Redeploy를 눌러야 새 값이 적용됩니다.
- **로컬 개발 시 `/api`는 실제로 호출되지 않습니다**: `npm run dev`(Vite)는 `api/` 폴더의 Serverless Function을 서빙하지 않습니다. `/api`를 포함한 전체 플로우를 로컬에서 테스트하려면 `vercel dev`를 사용하세요.

## 시작하기

1. `npm install`
2. `.env.example`을 `.env.local`로 복사하고 값 채우기
   - `OPENROUTER_API_KEY`: OpenRouter API 키
   - `OPENROUTER_MODEL`: 사용할 무료(`:free`) 모델 ID
3. `npm run dev` — 프론트엔드만 확인 (UI/로직 개발용)
   또는 `vercel dev` — `/api` 라우트를 포함한 전체 플로우 테스트
4. `npm run build` — 타입체크 + 프로덕션 빌드
5. `npm test` — 단위 테스트 실행 (Vitest)

## 배포

Vercel에 GitHub 저장소를 연결하고 `OPENROUTER_API_KEY`, `OPENROUTER_MODEL` 환경변수를 프로젝트 설정에 등록하면 `api/` 폴더가 자동으로 Serverless Function 2개로 배포됩니다. `master` 브랜치에 푸시할 때마다 자동으로 재배포됩니다.

## 프로젝트 구조

```
project004/
├── src/
│   ├── components/
│   │   ├── OnboardingForm.tsx    # 직무/집중 카테고리 선택 폼
│   │   ├── StreakHeader.tsx      # 스트릭 카운터 + 난이도 배지 + 잔디 그리드
│   │   ├── ChatWindow.tsx        # 채팅 메시지 목록 + 답변 입력
│   │   ├── MessageBubble.tsx     # 질문/답변/피드백 말풍선
│   │   └── BackupControls.tsx    # 백업 내보내기/가져오기 (설정 팝오버 또는 인라인)
│   ├── hooks/
│   │   ├── useLocalStorage.ts    # 상태 로드/저장, 온보딩, 답변 기록, 백업 가져오기
│   │   ├── useDailyQuestion.ts   # /api/generate-question 호출
│   │   └── useSubmitAnswer.ts    # /api/submit-answer 호출
│   ├── lib/                      # 순수 함수 (전부 단위 테스트 있음)
│   │   ├── storage.ts            # Local Storage 직렬화/역직렬화/검증
│   │   ├── streak.ts             # 스트릭 유예/리셋 계산
│   │   ├── difficulty.ts         # 난이도 자동 조절 계산
│   │   └── date.ts               # 로컬 날짜 포맷/오프셋 계산
│   ├── App.tsx                   # 화면 전환(온보딩/복구/메인) 및 데이터 배선
│   └── main.tsx
├── api/                          # Vercel Serverless Function (OpenRouter 프록시)
│   ├── generate-question.ts      # 질문 생성
│   ├── submit-answer.ts          # 채점 + 피드백 (LLM 1회 호출)
│   └── _shared/
│       ├── openrouter.ts         # OpenRouter 호출 공통 헬퍼 + 에러 처리
│       └── aiResponseSchema.ts   # 구조화 JSON 응답 파싱/검증
├── types/index.ts                # 공용 타입 (AppState, HistoryEntry, API 요청/응답 등)
├── PRD.md                        # 기능 명세 및 정책 결정 사항
├── CLAUDE.md                     # 이 프로젝트에서 AI가 따라야 할 작업 규칙
└── docs/superpowers/             # 초기 설계/구현 계획 문서
```

## 기술 스택

| 영역 | 스택 |
|---|---|
| Frontend | React 18 + TypeScript (SPA), Tailwind CSS, Vite |
| Backend | Node.js — Vercel Serverless Function 2개 (`api/generate-question.ts`, `api/submit-answer.ts`). OpenRouter API 키를 숨기는 프록시 역할만 수행 |
| Database | 없음 — 브라우저 Local Storage로 상태 관리 (MVP) |
| AI | OpenRouter API, 무료(`:free`) 모델 — 모델명은 하드코딩하지 않고 환경변수(`OPENROUTER_MODEL`)로 관리 |
| Test | Vitest (`src/lib`, `api/_shared`, API 라우트 핸들러) |

## 문서

- 기능 명세: [`PRD.md`](./PRD.md)
- 작업 규칙: [`CLAUDE.md`](./CLAUDE.md)
- 설계: [`docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md`](./docs/superpowers/specs/2026-08-24-mvp-scaffold-design.md)
