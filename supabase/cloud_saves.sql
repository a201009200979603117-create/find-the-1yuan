-- 大海撈一元：雲端存檔（用 Google 帳號登入，換裝置接著玩）
-- 用法：Supabase 後台左邊的 SQL Editor → New query，整段貼上按 Run。重複執行也沒關係。
-- 只存 Google 給的帳號編號（user_id）和存檔內容，不存 Email。每個人只看得到、改得到自己的存檔。

create table if not exists public.cloud_saves (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  sid        text        not null,                 -- 遊戲裡每個存檔自己的編號（開新局時產生）
  name       text        not null default '',      -- 存檔名稱（給清單看）
  size       text        not null default '',      -- 硬幣山大小
  saved_at   bigint      not null,                 -- 遊戲存檔的時間（毫秒），用來比哪邊比較新
  data       text        not null,                 -- 壓縮過的存檔碼（FT1Y:...）
  updated_at timestamptz not null default now(),
  primary key (user_id, sid),
  constraint cloud_saves_sid  check (char_length(sid) between 8 and 64),
  constraint cloud_saves_name check (char_length(name) <= 40),
  constraint cloud_saves_size check (char_length(size) <= 16),
  constraint cloud_saves_data check (octet_length(data) <= 2000000)
);

-- 只有登入的人，而且只能碰自己的存檔；沒登入（anon）什麼都不能做
alter table public.cloud_saves enable row level security;
drop policy if exists "看自己的存檔" on public.cloud_saves;
create policy "看自己的存檔" on public.cloud_saves for select to authenticated using (user_id = auth.uid());
drop policy if exists "新增自己的存檔" on public.cloud_saves;
create policy "新增自己的存檔" on public.cloud_saves for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "更新自己的存檔" on public.cloud_saves;
create policy "更新自己的存檔" on public.cloud_saves for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "刪掉自己的存檔" on public.cloud_saves;
create policy "刪掉自己的存檔" on public.cloud_saves for delete to authenticated using (user_id = auth.uid());
revoke all on public.cloud_saves from anon;
grant select, insert, update, delete on public.cloud_saves to authenticated;

-- 帳號一律用登入的那個人、時間用伺服器的；每個帳號最多 10 個雲端存檔（更新原本那個不算新的）
create or replace function public.cloud_saves_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.user_id := auth.uid();
  new.updated_at := now();
  if tg_op = 'INSERT'
     and not exists (select 1 from public.cloud_saves where user_id = new.user_id and sid = new.sid)
     and (select count(*) from public.cloud_saves where user_id = new.user_id) >= 10 then
    raise exception 'too many cloud saves (max 10)';
  end if;
  return new;
end $$;
drop trigger if exists cloud_saves_guard on public.cloud_saves;
create trigger cloud_saves_guard before insert or update on public.cloud_saves for each row execute function public.cloud_saves_guard();
