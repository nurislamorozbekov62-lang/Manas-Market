# Manas Market — React + Vite

Рабочий кабинет продавца на JavaScript/JSX: Supabase Auth, регистрация, создание одного магазина, управление товарами и быстрая фиксация продаж. Публичный каталог намеренно не включён.

## Запуск

1. Создайте проект Supabase и по порядку выполните `supabase/migrations/001_initial_seller_schema.sql`, затем `supabase/migrations/002_sales.sql` в SQL Editor.
2. Скопируйте `.env.example` в `.env.local` и заполните `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`.
3. Установите зависимости и запустите Vite:

```bash
npm install
npm run dev
```

Для production-сборки выполните `npm run build`. При размещении настройте SPA fallback на `index.html` для маршрутов кабинета.

Для локальной разработки можно отключить подтверждение email в настройках Supabase Auth. В production добавьте адрес приложения в разрешённые redirect URLs.
