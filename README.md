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
