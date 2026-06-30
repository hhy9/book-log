# 책장(BookShelf) — 작업 목록 (TASKS)

> AI CLI는 위에서부터 미완료 항목을 **하나씩** 처리한다. 한 번에 여러 개 하지 않는다.
> 한 항목을 끝내면 `lint`/`typecheck` 통과 확인 후 체크하고 다음으로 넘어간다.

## Step 0 — 셋업
- [x] Next.js(App Router)+TypeScript 프로젝트 생성
- [x] Tailwind CSS + shadcn/ui 설치 및 기본 설정
- [x] TanStack Query Provider 설정 (앱 전역 래핑)
- [x] 폴더 구조 생성 (CLAUDE.md의 구조대로)
- [x] `.env.local` 준비 (ALADIN_TTB_KEY), `.gitignore`에 포함 확인

## Step 1 — MVP: 검색 → 서재 담기 → 목록
- [x] `/api/search` Route Handler: 알라딘 검색 프록시 (키 서버 보관)
- [x] 도메인 타입 정의 (Book, ShelfItem)
- [x] `/search` 페이지: 검색창 + 결과 카드 (로딩/빈/에러 상태 포함)
- [x] 검색 입력 디바운싱 적용
- [x] localStorage 기반 서재 저장 로직 (담기/빼기)
- [x] `/shelf` 페이지: 상태별 탭(읽고싶어요/읽는중/완독) + 상태 변경
- [x] **여기서 한 번 Vercel에 배포해보기** (이른 배포로 막힘 확인)

## Step 2 — 기록 강화
- [x] `/book/[isbn]` 상세 페이지 (알라딘 상세 API)
- [x] 별점(0~5) 입력 컴포넌트
- [x] 메모 / 시작일 / 완독일 입력 및 저장

## Step 3 — 통계 대시보드
- [x] 통계 계산 유틸 (월별 완독수, 장르 분포, 누적 페이지, 평균 평점)
- [x] `/stats` 페이지: 월별 라인/바 차트 (Recharts)
- [x] 장르 도넛 차트
- [x] 요약 카드 (올해 완독 권수 / 누적 페이지 / 평균 평점)
- [x] 데이터 없을 때 빈 상태 UI
- [x] 완독,읽고싶은 책 태그별로 책 제목, 작가, 출판사 리스트를 텍스트로 복사

## Step 4 — AI 추천
- [x] `/api/recommend` Route Handler: LLM 호출 (키 서버 보관, JSON 응답 강제)
- [x] `/recommend` 페이지: 자연어 입력 → 추천 결과 스트리밍/표시
- [x] 추천 제목을 알라딘으로 재검색해 실제 표지/링크 매칭
- [x] 매칭 실패 처리 (없는 책 걸러내기)
- [x] "내 서재 기반 취향 분석 + 추천" 옵션

## Step 5 — 제품화 마무리
- [ ] Supabase 연동: books / shelfItems 테이블, localStorage → DB 이전
- [ ] Supabase Auth 로그인 (이메일 또는 OAuth)
- [ ] 반응형 점검 + 다크모드
- [ ] 최종 배포 + 커스텀 점검
- [ ] README 작성 (스크린샷, 기술 선택 이유, 트러블슈팅, 데모 링크)

## 이번 주 목표
- Phase 0 전체 + Phase 1의 `/api/search`까지. ("검색해서 결과 카드 띄우기"가 보이면 성공)
