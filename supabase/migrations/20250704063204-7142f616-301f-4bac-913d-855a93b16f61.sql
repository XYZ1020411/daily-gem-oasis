-- 啟用 pg_cron 和 pg_net 擴展
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 設置每日自動抓取小說的定時任務 (每天早上 8:00 執行)
SELECT cron.schedule(
  'daily-novel-fetch',
  '0 8 * * *', -- 每天早上 8:00
  $$
  SELECT
    net.http_post(
        url:='https://fohoticyvvddiqvdvjuk.supabase.co/functions/v1/fetch-daily-novel',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvaG90aWN5dnZkZGlxdmR2anVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4MzM2MTMsImV4cCI6MjA1NjQwOTYxM30.9G9TEOJcI1PXhOGkRjRIduZ9df_ekn8IinfpvZJUfy0"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);