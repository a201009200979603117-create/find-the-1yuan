-- 大海撈一元：線上排行榜（每日挑戰）
-- 用法：Supabase 後台左邊的 SQL Editor → New query，整段貼上按 Run。重複執行也沒關係。

-- 成績：每一筆是一次完成的每日挑戰
create table if not exists public.scores (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  board      date        not null,                 -- 哪一天的每日挑戰
  name       text        not null,                 -- 玩家取的暱稱
  seconds    integer     not null,                 -- 找出所有 1 元用了幾秒
  player     text        not null,                 -- 瀏覽器裡隨機產生的編號，用來把同一個人的成績合在一起
  constraint scores_name    check (char_length(name) between 1 and 16 and name !~ '[<>]'),
  constraint scores_seconds check (seconds between 60 and 360000),
  constraint scores_player  check (char_length(player) between 8 and 40)
);
create index if not exists scores_board_seconds on public.scores (board, seconds);
create index if not exists scores_player_time on public.scores (player, created_at);

-- 只能看、只能新增；不能改、不能刪
alter table public.scores enable row level security;
drop policy if exists "排行榜大家都看得到" on public.scores;
create policy "排行榜大家都看得到" on public.scores for select using (true);
drop policy if exists "只能交最近幾天的成績" on public.scores;
create policy "只能交最近幾天的成績" on public.scores for insert
  with check (board between (now() at time zone 'utc')::date - 1 and (now() at time zone 'utc')::date + 1);
revoke update, delete, truncate on public.scores from anon, authenticated;
grant select, insert on public.scores to anon, authenticated;

-- 擋掉狂送：同一個玩家 20 秒內只能交一次；時間一律用伺服器的
create or replace function public.scores_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.scores where player = new.player and created_at > now() - interval '20 seconds') then
    raise exception 'too many scores, wait a moment';
  end if;
  new.created_at := now();
  return new;
end $$;
drop trigger if exists scores_guard on public.scores;
create trigger scores_guard before insert on public.scores for each row execute function public.scores_guard();

-- 每個玩家每天只留最好的一筆
create or replace view public.best_scores with (security_invoker = true) as
  select distinct on (board, player) board, player, name, seconds, created_at
  from public.scores
  order by board, player, seconds asc, created_at asc;
grant select on public.best_scores to anon, authenticated;
