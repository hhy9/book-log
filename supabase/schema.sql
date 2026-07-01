-- BookLog — Supabase 스키마 (books / shelf_items) + RLS
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 Run.
-- 익명 로그인 사용자와 Google 로그인 사용자 모두 `authenticated` 역할이므로
-- 각자 자기 데이터(shelf_items.user_id)만 접근하도록 RLS로 격리한다.

-- =========================================================
-- 1) books : 알라딘에서 받은 책 기본 정보 캐시 (공유, 사용자 무관)
-- =========================================================
create table if not exists public.books (
  isbn        text primary key,
  title       text not null,
  author      text,
  publisher   text,
  cover_url   text,
  category    text,
  pub_date    text,
  description text,
  page_count  integer not null default 0,
  created_at  timestamptz not null default now()
);

-- =========================================================
-- 2) shelf_items : 내 서재 기록 (사용자별)
-- =========================================================
create table if not exists public.shelf_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  isbn        text not null references public.books(isbn) on delete cascade,
  status      text not null default 'want' check (status in ('want', 'reading', 'done')),
  rating      integer check (rating between 0 and 5),
  memo        text,
  started_at  date,
  finished_at date,
  created_at  timestamptz not null default now(),
  unique (user_id, isbn)
);

create index if not exists shelf_items_user_idx on public.shelf_items (user_id);
create index if not exists shelf_items_user_status_idx on public.shelf_items (user_id, status);

-- =========================================================
-- 3) RLS 활성화
-- =========================================================
alter table public.books enable row level security;
alter table public.shelf_items enable row level security;

-- books: 로그인(익명 포함)한 사용자는 누구나 읽고, 담을 때 캐시할 수 있음(공유 데이터)
drop policy if exists "books_select" on public.books;
create policy "books_select" on public.books
  for select to authenticated using (true);

drop policy if exists "books_insert" on public.books;
create policy "books_insert" on public.books
  for insert to authenticated with check (true);

drop policy if exists "books_update" on public.books;
create policy "books_update" on public.books
  for update to authenticated using (true) with check (true);

-- shelf_items: 오직 자기 자신의 행만 CRUD 가능
drop policy if exists "shelf_select_own" on public.shelf_items;
create policy "shelf_select_own" on public.shelf_items
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "shelf_insert_own" on public.shelf_items;
create policy "shelf_insert_own" on public.shelf_items
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "shelf_update_own" on public.shelf_items;
create policy "shelf_update_own" on public.shelf_items
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "shelf_delete_own" on public.shelf_items;
create policy "shelf_delete_own" on public.shelf_items
  for delete to authenticated using (auth.uid() = user_id);
