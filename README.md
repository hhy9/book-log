# 책장 (BookLog) 📚

내가 읽은/읽을 책을 **기록**하고, 독서 **통계를 차트**로 보고, **AI로 다음 책을 추천**받는 개인용 독서 기록 웹앱.

> **데모**: https://book-log-steel.vercel.app/ · **레포**: https://github.com/hhy9/book-log

한 프로젝트에서 **검색·상태관리**, **데이터 시각화(차트)**, **LLM 통합**, **인증·DB**를 모두 다룹니다.

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 🔍 **책 검색** | 알라딘 OpenAPI로 제목/저자 검색, 디바운싱 적용, 결과 카드 표시 |
| 📖 **내 서재** | 읽고싶어요 / 읽는중 / 완독 상태별 탭 관리 |
| ⭐ **기록** | 책 상세 페이지에서 별점(0~5)·메모·시작일/완독일 저장 |
| 📊 **통계 대시보드** | 월별 완독(막대), 장르 분포(도넛), 누적 페이지·평균 평점 요약, 목록 텍스트 복사 |
| 🤖 **AI 추천** | 자연어 입력 → Gemini가 추천 → 알라딘으로 실제 표지/링크 매칭. "내 서재 기반 취향 분석" 옵션 |
| 🔐 **로그인·동기화** | 로그인 없이 바로 사용(익명), 선택적 Google 로그인 시 기기 간 DB 동기화 |
| 🌗 **다크모드 / 반응형** | 테마 토글(FOUC 없음), 모바일 대응 |

---

## 🛠 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | **Next.js 16** (App Router, Route Handlers, Proxy) · React 19 · TypeScript |
| 스타일 | **Tailwind CSS v4** · shadcn/ui · lucide-react |
| 서버 상태 | **TanStack Query** (검색/추천 fetch·캐싱) |
| 클라이언트 상태 | **Zustand** (서재 인메모리 미러) |
| 차트 | **Recharts** |
| AI | **Google Gemini** (`@google/genai`, `gemini-2.5-flash`) |
| 인증·DB | **Supabase** (Postgres + Auth, `@supabase/ssr`, RLS) |
| 외부 API | 알라딘 OpenAPI (검색/상세) |
| 배포 | Vercel |

### 기술 선택 이유
- **Next.js Route Handler**: 알라딘·Gemini API 키를 브라우저에 노출하지 않고 **서버에서만** 사용하기 위해. 모든 외부 호출은 서버 경유.
- **TanStack Query vs 직접 fetch**: 검색 디바운싱·로딩/에러 상태·캐싱을 선언적으로 처리.
- **Zustand + Supabase 하이브리드**: UI는 즉시 반응(낙관적 로컬 업데이트)하고, DB 저장은 백그라운드로. 실패 시 롤백.
- **Supabase 익명 인증**: 포트폴리오 특성상 방문자가 **가입 없이 바로 체험**하되, 원하면 Google 로그인으로 동기화 — 진입 마찰과 완성도를 동시에.
- **RLS(Row Level Security)**: 각 사용자가 자기 데이터만 접근하도록 DB 레벨에서 격리.

---

## 🗂 프로젝트 구조

```
src/
├─ app/
│  ├─ api/
│  │  ├─ search/route.ts        # 알라딘 검색 프록시
│  │  ├─ book/[isbn]/route.ts   # 알라딘 상세 프록시
│  │  └─ recommend/route.ts     # Gemini 추천 + 알라딘 매칭
│  ├─ auth/callback/route.ts    # Google OAuth 콜백
│  ├─ search/ shelf/ stats/ recommend/ book/[isbn]/   # 페이지
│  └─ layout.tsx
├─ features/
│  ├─ search/  shelf/  book-detail/  stats/  recommend/  auth/
├─ lib/
│  ├─ aladin.ts                 # 알라딘 검색 공용 헬퍼
│  ├─ supabase/                 # client / server / shelf-db
│  └─ use-debounce.ts  use-hydrated.ts
├─ components/  (nav, theme-toggle, query-provider, ui)
├─ types/  (book, shelf)
└─ proxy.ts                     # 세션 갱신 (Next 16의 middleware)
supabase/schema.sql             # 테이블 + RLS 정책
```

### 데이터 모델
- **books** (`isbn` PK): 알라딘에서 받은 책 기본정보 캐시(공유)
- **shelf_items** (`user_id`로 격리): status / rating / memo / started_at / finished_at

---

## 🚀 로컬 실행

**요구사항**: Node.js 20.9+ (권장 24)

```bash
git clone https://github.com/hhy9/book-log.git
cd book-log
npm install
cp .env.local.example .env.local   # 값 채우기 (아래)
npm run dev                        # http://localhost:3000
```

### 환경변수 (`.env.local`)
```bash
# 알라딘 OpenAPI (https://www.aladin.co.kr/ttb/wblog_manage.aspx)
ALADIN_TTB_KEY=...

# Google Gemini (https://aistudio.google.com/apikey) — 무료 티어 가능
GEMINI_API_KEY=...

# Supabase (Settings → API)  ※ URL은 Project URL, 경로 없이!
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

### Supabase 준비
1. 프로젝트 생성 → `supabase/schema.sql`을 **SQL Editor**에서 실행 (books/shelf_items + RLS)
2. Authentication → **Anonymous sign-ins**, **Manual linking**, **Google provider** 활성화
3. URL Configuration에 로컬(`http://localhost:3000`)·배포 도메인 등록

### 스크립트
```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

---

## 🧩 트러블슈팅 (실제 겪은 이슈)

- **상태관리 — localStorage → DB 전환**: 컴포넌트를 대거 수정하지 않으려고 Zustand store의 **공개 API는 유지**하고 내부만 Supabase 연동으로 교체. 액션은 낙관적 로컬 업데이트 후 백그라운드 DB 저장, 실패 시 롤백. 로그인 시 기존 localStorage 데이터를 **1회 마이그레이션**.
- **AI 매칭 — LLM 환각(없는 책)**: Gemini 응답을 `responseSchema`로 **JSON 강제**하고, 받은 제목을 **알라딘으로 재검색해 실제 존재하는 책만** 카드로 노출(매칭 실패 시 제외).
- **AI 안정성 — Gemini 503(과부하)**: 무료 모델이 순간 몰릴 때 `503 UNAVAILABLE` 발생 → **짧은 백오프 재시도** + 429(한도)/503(혼잡) 구분 안내.
- **차트 — 다크모드**: Recharts 축/툴팁 색을 `hsl(var(--border))`(오작동) → `var(--border)` 등 실제 CSS 변수로 교체해 테마에 맞게 반영.
- **이미지 — NAT64 사설 IP 차단**: 특정 네트워크에서 Next 이미지 최적화기가 알라딘 표지 호스트를 사설 IP로 오인해 차단 → `images.unoptimized`로 우회.
- **인증 — 익명→Google 재연결 실패**: 이미 존재하는 Google 계정은 `identity_already_exists`로 링크 불가 → **일반 로그인으로 자동 폴백**.
- **Next.js 16 변경점**: `middleware.ts` → **`proxy.ts`**(함수명 `proxy`)로 이름 변경 대응.

---

## 📌 이력서 한 줄

> 독서 기록·통계 대시보드 + AI 추천 웹앱 (Next.js 16·TypeScript·TanStack Query·Recharts·Supabase·Gemini) 

---
