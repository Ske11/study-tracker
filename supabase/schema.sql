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
  created_at timestamptz not null default now()
);

-- 复习历史表
create table if not exists review_history (
  id bigint generated always as identity primary key,
  problem_id text not null references problems(id) on delete cascade,
  date date not null default current_date,
  confidence integer not null,
  created_at timestamptz not null default now()
);

-- 索引
create index if not exists idx_problems_next_review on problems(next_review);
create index if not exists idx_problems_pattern on problems(pattern);
create index if not exists idx_review_history_problem_id on review_history(problem_id);

-- RLS (Row Level Security) - 如果需要多用户隔离可启用
-- alter table problems enable row level security;
-- alter table review_history enable row level security;
