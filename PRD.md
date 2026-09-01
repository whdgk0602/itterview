# PRD 및 기능 명세서

## IT 기술면접 데일리 AI 코칭 서비스 (MVP)

---

## 1. 프로젝트 개요 (Overview)

본 프로젝트는 취업 준비생들이 매일매일 기술 면접 감각을 잃지 않도록 돕는 AI 기반 데일리 코칭 웹 서비스입니다. 단발성 문답을 넘어 유저의 학습 히스토리와 정답률을 기반으로 난이도를 동적으로 조절하며, 루틴(Streak) 유지를 최우선 목표로 합니다.

- **Target Audience**: IT 개발 직군 취업 준비생
- **Core Value**:
  - 마찰 없는 데일리 로그인 (frictionless daily check-in)
  - 날카로운 실전 면접 피드백
  - 스트릭 보호를 위한 능동적 난이도 조절

---

## 2. 시스템 아키텍처 (Tech Stack)

| 구분 | 기술 스택 | 비고 |
|---|---|---|
| Frontend | React (SPA) | 채팅 UI 기반 설계 |
| Backend | Node.js (Vercel Serverless Function 2개: 질문 생성 / 채점+피드백) | 목적이 다른 두 프롬프트를 분리해 각각 OpenRouter API 키를 숨기는 프록시 역할만 수행. 둘 다 OpenRouter 호출/에러 처리 로직은 공통 헬퍼(`_shared/openrouter.ts`)로 공유. Firebase Functions는 외부 API 아웃바운드 호출에 유료(Blaze) 플랜이 필요해 비용상 불리하므로 미채택 |
| Database | Local Storage | 초기 MVP 단계에서의 비용 절감 및 빠른 구현 (Client-side) |
| AI Model | OpenRouter API (무료 모델, `:free` 접미사) | 특정 모델명을 하드코딩하지 않고 환경변수로 관리 (무료 모델은 목록이 자주 바뀌고 rate limit이 있음) |

---

## 3. 기능 명세서 (Functional Requirements)

### F1. 유저 온보딩 및 초기 설정

- **목표 직무 설정**: 프론트엔드, 백엔드, iOS, Android 등 타겟 직무 입력
- **집중 공략 카테고리 설정**: 주 단위로 집중할 주제(예: 운영체제, 네트워크, 자료구조 등) 선택

### F2. 데일리 질문 생성 (AI 출제)

- 유저가 서비스에 접속하면 Vercel API를 통해 AI 모델(OpenRouter)에 질문 생성 요청
- 로컬 스토리지에 저장된 유저의 전날 정답 여부를 파악하여 동적 난이도 조절 적용
  - 난이도는 `기초` / `보통` / `심화` 3단계
  - 2일 연속 오답 시 한 단계 하향 (최저 `기초`에서는 유지)
  - 2일 연속 정답 시 한 단계 상향 (최고 `심화`에서는 유지)

### F3. 채팅 기반 상호작용 (UI/UX)

- 텍스트 입력 기반의 채팅 인터페이스 제공 (마이크/음성 입력 배제)
- 질문에 대한 키워드 중심의 서술형 답변 입력 기능

### F4. AI 피드백 및 꼬리질문

- 제출된 답변에 대해 실무 시니어 개발자 페르소나로 객관적인 피드백 제공
- 정답인 경우: 실무 적용 사례나 심화 개념을 묻는 꼬리질문 1회 추가 제시
- 오답 또는 '모르겠음' 입력 시: 정답과 해설 제공 후 격려 메시지 출력
- **채점 로직**: 별도의 채점 API 호출 없이, 정답 판정(`isCorrect`)과 피드백을 한 번의 LLM 호출에서 구조화된 JSON으로 함께 받는다.

  ```json
  {
    "isCorrect": true,
    "feedback": "정확합니다. 다만 메모리 단편화 관점에서는...",
    "followUpQuestion": "그렇다면 페이지 폴트가 발생했을 때는 어떻게 처리되나요?",
    "encouragement": null
  }
  ```

  정답이면 `followUpQuestion`을 채우고 `encouragement`는 null, 오답/모르겠음이면 `feedback`에 정답+해설을 담고 `encouragement`를 채운다. JSON 파싱 실패 시 1회 재시도한다.

### F5. 스트릭(Streak) 및 히스토리 관리

- 데일리 미션 완료 시 출석일수(Streak) 증가
- 상단에 잔디(github contribution graph 형태) 형태의 시각적 스트릭 UI 제공
- **스트릭 유예(1일) 규칙**: `lastCheckIn`과 오늘 날짜의 차이로 판단한다.
  - 차이 0일 (오늘 이미 완료): 무시
  - 차이 1일 (어제 완료): `streak += 1`
  - 차이 2일 (하루 결석): 유예 적용, `streak += 1` (리셋하지 않음)
  - 차이 3일 이상: `streak = 1`로 리셋
  - MVP 단순화를 위해 유예 사용 횟수 제한은 두지 않는다 (추후 필요 시 `freezeUsedThisMonth` 등으로 확장 가능).

---

## 4. 데이터 스키마 (Local Storage)

별도의 DB 없이 클라이언트 브라우저에서 상태를 관리하기 위한 JSON 스키마입니다.

```json
{
  "userProfile": {
    "targetJob": "프론트엔드 개발자",
    "focusTopic": "운영체제(OS)",
    "difficultyLevel": "보통"
  },
  "streak": 5,
  "lastCheckIn": "2026-08-23",
  "history": [
    {
      "date": "2026-08-22",
      "question": "가상 주소 공간이 36비트이고...",
      "isCorrect": true,
      "feedback": "정확합니다. 메모리 단편화 관점에서는..."
    }
  ]
}
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `userProfile.targetJob` | string | 온보딩 시 설정한 목표 직무 |
| `userProfile.focusTopic` | string | 이번 주 집중 공략 카테고리 |
| `userProfile.difficultyLevel` | string | 현재 적용 중인 난이도 (동적으로 조절됨) |
| `streak` | number | 연속 출석/미션 완료 일수 |
| `lastCheckIn` | string (YYYY-MM-DD) | 마지막 체크인 날짜 |
| `history` | array | 일자별 질문/정답 여부/피드백 기록 |

---

## 5. 정책 결정 사항 (Decisions)

원본 문서에 명시되지 않았던 항목을 논의 후 확정했습니다.

| 항목 | 결정 |
|---|---|
| AI 모델 비용 | OpenRouter 무료(`:free`) 모델 사용. 모델명은 하드코딩하지 않고 환경변수로 관리 (무료 모델 목록/rate limit이 자주 바뀜) |
| 백엔드 | Vercel Serverless Function 2개(질문 생성 / 채점+피드백)로 OpenRouter 키를 숨기는 프록시만 수행. 목적이 다른 두 프롬프트라 분리, 공통 로직은 `_shared/openrouter.ts`로 공유. Firebase는 아웃바운드 호출에 유료 플랜이 필요해 미채택 |
| 채점 로직 | AI가 자유서술형 답변을 보고 판단. 정답 여부(`isCorrect`)와 피드백을 한 번의 LLM 호출에서 구조화된 JSON으로 함께 받음 (F4 참고) |
| 스트릭 보호 | 하루 결석까지는 유예, 이틀 이상 결석 시 리셋 (F5 참고) |

### 5-1. 여전히 남아있는 미확정 항목

- 로컬 스토리지 기반이므로 기기 변경/브라우저 초기화 시 데이터 유실 대응 방안 (감수할지, export/import 기능을 둘지)
- 구체적으로 사용할 무료 모델명 (구현 시점에 OpenRouter에서 사용 가능한 `:free` 모델 목록 확인 후 확정)
- OpenRouter 무료 모델 일일/분당 요청 한도 초과 시 사용자에게 보여줄 실패 처리 방식
