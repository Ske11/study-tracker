-- Supabase SQL: 创建 LeetCode 复习追踪器的数据表
-- 在 Supabase Dashboard > SQL Editor 中执行此脚本

-- 题目表
create table if not exists problems (
  id text primary key,
  number text,
  title text not null,
  pattern text not null default 'other',
  alt_pattern text not null default '[]',
  difficulty text not null default 'medium',
  confidence integer not null default 3,
  notes text default '',
  url text default '',
  added_at date not null default current_date,
  last_review date not null default current_date,
  next_review date not null default current_date,
  review_count integer not null default 0,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 复习历史表
create table if not exists review_history (
  id bigint generated always as identity primary key,
  problem_id text not null references problems(id) on delete cascade,
  date date not null default current_date,
  confidence integer not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- 索引
create index if not exists idx_problems_next_review on problems(next_review);
create index if not exists idx_problems_pattern on problems(pattern);
create index if not exists idx_problems_user_id on problems(user_id);
create index if not exists idx_review_history_problem_id on review_history(problem_id);
create index if not exists idx_review_history_user_id on review_history(user_id);

-- RLS (Row Level Security)
alter table problems enable row level security;
alter table review_history enable row level security;

-- problems RLS 策略
create policy "select own" on problems for select using (auth.uid() = user_id);
create policy "insert own" on problems for insert with check (auth.uid() = user_id);
create policy "update own" on problems for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on problems for delete using (auth.uid() = user_id);

-- review_history RLS 策略
create policy "select own" on review_history for select using (auth.uid() = user_id);
create policy "insert own" on review_history for insert with check (auth.uid() = user_id);
create policy "update own" on review_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own" on review_history for delete using (auth.uid() = user_id);

-- 用户设置表
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  patterns jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table user_settings enable row level security;
create policy "select own" on user_settings for select using (auth.uid() = user_id);
create policy "insert own" on user_settings for insert with check (auth.uid() = user_id);
create policy "update own" on user_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
