# Mango Cinema — Design Spec (MVP)

**Дата:** 2026-04-20
**Автор:** Команда Mango Production (совместно с AI-ассистентом в сессии brainstorming)
**Статус:** Draft → на ревью

---

## 1. Контекст

**Mango Cinema** — онлайн-кинотеатр и дистрибуционная площадка для AI-генерированных вертикальных микросериалов (формат 9:16, эпизоды 1–3 минуты, серии по 50–100 эпизодов). Сервис выступает одновременно стриминговой платформой и продакшеном: контент производят студии-подрядчики, Mango Cinema промоутит и распространяет под единым брендом.

**Флагман на запуске:** сериал «Запретная школа» (Mango Production). Каталог на MVP — 3–5 сериалов.

**Референсы формата:** ReelShort, DramaBox, ShortMax, FlexTV.

**Мотивация:** перейти от зависимости от TikTok/YouTube Shorts к собственному каналу дистрибуции и аудитории, агрегируя нескольких подрядчиков под Mango-брендом.

---

## 2. Цели и не-цели

### Цели (MVP)
- Публичный запуск через 6 месяцев.
- Веб-платформа (PWA) с каталогом, плеером в стиле TikTok, профилем и магазином монет.
- Гибридная монетизация: подписка (весь каталог) + монеты (поэпизодная покупка для не-подписчиков + ранний доступ для подписчиков).
- Внутренняя админка для команды Mango (CMS, пользователи, платежи).
- Россия — единственный целевой рынок на старте.

### Не-цели (явно вынесено за MVP)
- Генерация контента (делают подрядчики, Mango не разрабатывает ИИ-пайплайн).
- Нативные мобильные приложения iOS/Android (v1.x, поверх того же API).
- Портал самозагрузки для студий-подрядчиков (v1.x).
- Hardware DRM (Widevine L1/FairPlay).
- Запуск в СНГ и глобально.
- Триал-подписка (7 дней бесплатно).
- A/B-фреймворк, промокоды, реферальная программа.

---

## 3. Ограничения

| Ограничение | Значение |
|---|---|
| Таймлайн до публичного запуска | 6 месяцев |
| Бюджет на разработку | 3–10 млн ₽ |
| Команда | 1 фронт + 1 бэк + 1 фулстек на админку + полставки DevOps и дизайнер |
| Юрисдикция | РФ (152-ФЗ: данные пользователей хранятся внутри РФ) |
| Язык интерфейса | Русский |
| Платёжные провайдеры | ЮKassa (основной, карты + SberPay + Apple/Google Pay + рекуррент) + СБП (через ЮKassa SDK) |
| Платформа запуска | Web PWA (mobile-first) |

---

## 4. Системная архитектура

### 4.1 Клиенты
- **Web PWA** (Next.js 14+, React Server Components + Client) — публичный сайт с каталогом, плеером, профилем, магазином монет.
- **Admin Panel** (Next.js, отдельный domain/subdomain) — CMS для команды Mango.
- **Мобильные нативные** — вне MVP, v1.x.

### 4.2 Backend (монолит с чёткими модулями)
Единый Node.js-сервис (Fastify) с внутренним разделением на модули. Микросервисы — over-engineering для команды 2–3 человек.

| Модуль | Ответственность |
|---|---|
| API Gateway | Auth (JWT), rate limit, роутинг |
| Catalog | Series, episodes, метаданные, signed HLS URLs |
| Billing | Подписки, монеты, entitlements, webhooks ЮKassa/СБП |
| Identity | Phone OTP, VK ID, Yandex ID, сессии |
| Progress | Позиция просмотра, watchlist, «продолжить смотреть» |
| Ingest Worker | Фоновый ffmpeg-транскодинг в HLS, превью, обложки |

### 4.3 Данные и доставка контента
- **Postgres 16** (Yandex Managed) — весь OLTP.
- **Yandex Object Storage** (S3-совместимый) — masters, HLS-сегменты, обложки.
- **Yandex CDN** — раздача HLS по signed URL (TTL 60 сек).
- **Redis** (Yandex Managed) — сессии, rate limit, локи, кеш.

### 4.4 Внешние интеграции
- ЮKassa + СБП (через единый SDK).
- SMS-шлюз (Exolve или Yandex Cloud SMS) — OTP.
- VK ID / Yandex ID — OAuth 2.0.
- Sentry — ошибки.
- Amplitude (или PostHog) — продуктовая аналитика.
- Яндекс.Метрика — маркетинговая атрибуция.
- Grafana Cloud / Yandex Monitoring — метрики, алерты.

### 4.5 Ключевые потоки
- **Просмотр эпизода:** Web → API Gateway → Catalog проверяет entitlement → отдаёт signed HLS URL → Web играет напрямую через Yandex CDN.
- **Покупка монет:** Web → API → Billing создаёт payment в ЮKassa → редирект → webhook → баланс зачислен.
- **Загрузка эпизода:** Admin → API → master в Object Storage → Ingest Worker транскодит → обновляет метаданные.

---

## 5. Модель данных

### 5.1 Identity
- `users` — id, phone (unique), vk_id, yandex_id, display_name, avatar_url, created_at.
- `sessions` — id, user_id, token_hash, device_info, expires_at, created_at.
- `admin_users` — id, email, password_hash, role (`editor` | `admin`), created_at.

### 5.2 Content
- `studios` — id, name, logo_url, contact. Закладываем с первого дня ради будущего портала студий.
- `series` — id, slug, studio_id, title, description, poster_url, banner_url, status (`draft` | `scheduled` | `published`), release_date, genres[], tags[].
- `episodes` — id, series_id, number, title, description, duration_sec, hls_manifest_path, thumbnail_url, **is_free** (bool), **released_at**, **early_unlock_cost_coins** (int, для раннего доступа), status.

### 5.3 Billing / Monetization
- `plans` — id, slug, name, price_rub, period_days, is_active. Цены редактируются в админке.
- `subscriptions` — id, user_id, plan_id, status (`pending_payment` | `active` | `grace_period` | `canceled` | `expired`), autorenew, current_period_start/end, yukassa_payment_method_token, canceled_at.
- `coin_packages` — id, slug, name, coins, bonus, price_rub, is_active.
- `coin_balances` — user_id (pk), balance, updated_at.
- `coin_transactions` — id, user_id, delta, reason (`purchase` | `spend` | `grant` | `refund`), ref_type, ref_id, created_at.
- `episode_unlocks` — id, user_id, episode_id, via (`coins` | `coins_early` | `promo`), cost_coins_paid, created_at.
- `payments` — id, user_id, provider (`yukassa` | `sbp`), provider_payment_id (unique), amount_rub, purpose (`subscription` | `coin_package`), item_type, item_id, status, idempotency_key (unique), created_at, updated_at.

### 5.4 Behavior
- `progress` — (user_id, episode_id) pk, position_sec, completed, last_watched_at.
- `watchlist` — (user_id, series_id) pk, added_at.
- `events` — id, user_id, event_name, props (jsonb), ts, session_id. Батчи экспортируются в Amplitude.

### 5.5 Правило доступа к эпизоду
Пользователь `U` может смотреть эпизод `E` в момент `T`, если выполнено хотя бы одно:
1. `E.is_free = true`.
2. `T >= E.released_at` И у `U` активная подписка (`subscriptions.status = 'active'` и `current_period_end > T`).
3. Существует запись в `episode_unlocks(U, E)`.

Никаких других источников доступа. Это обеспечивает единственную точку принятия решения.

### 5.6 Финансовая строгость
- **Идемпотентность**: `payments.idempotency_key` unique. Webhook-и идемпотентны по `provider_payment_id`.
- **Монеты — double-entry**: `coin_balances.balance` = `SUM(coin_transactions.delta)`. Ежедневный job сверяет, расхождение → алерт.
- **Webhook — единственный источник правды для начислений**. Фронт после «успешной оплаты» не начисляет монеты сам.
- **Refund-ы**: возврат монет = отрицательная запись в `coin_transactions`. Баланс может уйти в минус; новые траты запрещены до пополнения.

---

## 6. Ключевые пользовательские сценарии

### 6.1 Холодный трафик → первая покупка
1. Заход на сайт (deep-link из рекламы) — **без регистрации**.
2. Бесплатный эп. 1 играет сразу, анонимно.
3. Свайп к эп. 2, если он тоже `is_free` — играет.
4. Первый `is_free = false` эпизод → paywall поверх размытого кадра.
5. На paywall — две опции на одном экране: подписка (primary CTA) и монеты.
6. Регистрация по телефону (OTP) инлайн — только в момент paywall.
7. Оплата → редирект назад в плеер → эпизод разблокирован.

**Правило:** регистрацию не требуем до момента paywall. Первые 2 эпизода играют без аккаунта.

### 6.2 Возвращающийся подписчик
1. Открывает сайт, cookie-сессия → автовход.
2. Первый экран — блок «Продолжить смотреть» (из `progress`).
3. Тап → плеер на нужной секунде.
4. Досмотр эпизода → авто-плей следующего через 2 сек (с кнопкой «Отмена»).
5. Если след. эпизод ещё не вышел — оверлей «Ранний доступ за X монет».

### 6.3 Не-подписчик разблокирует эпизод монетами
1. Свайп к закрытому эпизоду → paywall.
2. Баланс достаточен — списание → запись в `episode_unlocks` → эпизод играет.
3. Баланс недостаточен — переход в магазин монет → пакет → оплата → возврат в плеер → списание.
4. **Идемпотентность критична**: двойной клик не списывает дважды (client-side `idempotency_key`).

---

## 7. Плеер и доставка контента

### 7.1 UX (веб, mobile-first)
- Вертикальный формат 9:16 на весь экран (mobile), центрированный фрейм на desktop.
- **Вертикальный свайп** — между эпизодами одной серии.
- **Горизонтальный свайп** — к следующей рекомендованной серии (или закрытие плеера).
- **Tap-зоны:** лево/право — перемотка ±10 сек, центр — пауза, верх — меню эпизодов, низ — свайп-стрип с номерами (видимый, с бесплатно/заблокированными).
- **Paywall** — оверлей поверх размытого кадра (не чёрный экран), две опции (подписка + монеты) на одном экране.
- **Правые действия** — like, share, добавить в watchlist (TikTok-стиль).
- **Авто-плей** следующего эпизода через 2 сек после окончания с кнопкой отмены.
- **Прогресс-бар** сверху экрана, тонкий.

### 7.2 Технический поток
- **Ingest:** admin загружает master → Object Storage → Ingest Worker (VM с GPU, spot-instance) через ffmpeg транскодит в HLS с ABR-лестницей: 540×960 @ 1.2 Mbps, 720×1280 @ 2.4 Mbps, 1080×1920 @ 4.5 Mbps. Генерирует sprite для scrubbing и обложку. Обновляет `episodes.hls_manifest_path`, статус → `ready`.
- **Playback:** плеер запрашивает `GET /api/episodes/:id/manifest` → Catalog проверяет правило доступа (см. 5.5) → подписывает URL master-плейлиста с TTL 60 сек (HMAC на уровне Yandex CDN). hls.js тянет сегменты напрямую с CDN.
- **Progress sync:** плеер шлёт `POST /api/progress` каждые 10 сек (throttled) + при `pagehide`/`beforeunload`. Идемпотентность по `(user_id, episode_id)`. При ≥95% длительности → `completed = true`.

### 7.3 Защита контента (MVP)
- Signed HLS URL с TTL 60 сек.
- Watermark в углу с `user_id` (полупрозрачный, через CSS overlay в плеере — не врезан в видео, снижает расходы).
- Rate limit на `/manifest`: 10 запросов/мин на user.
- **Без hardware DRM.** Добавляем в v1.x при подтверждённой проблеме пиратства.

---

## 8. Платежи и жизненный цикл подписки

### 8.1 State machine подписки
- `pending_payment` → `active` (webhook `payment.succeeded`).
- `pending_payment` → `expired` (webhook `payment.canceled` или таймаут 30 мин).
- `active` → `active` (продление: scheduler за 1 день до `current_period_end` запускает рекуррент через сохранённый token → webhook `payment.succeeded`).
- `active` → `grace_period` (рекуррент упал; доступ сохраняем 3 дня, retry каждые 24 часа).
- `grace_period` → `active` (retry успешен).
- `grace_period` → `expired` (все retry провалились).
- `active` → `canceled` (пользователь отменил; доступ до конца оплаченного периода).
- `canceled` → `expired` (наступил `current_period_end`).
- `expired` → `active` (покупка заново → новая запись `subscriptions`).

### 8.2 Провайдеры
- **ЮKassa** — основной. Visa/MC/МИР, Apple Pay, Google Pay, SberPay. Рекуррент через сохранённый token.
- **СБП** — через ЮKassa SDK, отдельной кнопкой. **Не поддерживает рекуррент** — подписка через СБП требует ручной оплаты каждый месяц. Предупреждаем на экране выбора способа.

### 8.3 Обязательные edge-case-ы
- **Оплатил, но ушёл со страницы до редиректа:** баланс/entitlement приходит всегда из webhook, не из redirect-URL.
- **Оплатил, webhook задержался:** фронт поллит `GET /api/subscriptions/current` раз в 3 сек первые 30 сек, затем показывает «проверка платежа, нажмите обновить».
- **Двойная доставка webhook:** `provider_payment_id` unique → повтор = no-op.
- **Двойной клик «купить»:** `idempotency_key` unique → один платёж.

---

## 9. Админка (CMS для команды Mango)

### 9.1 Hard MVP (9 экранов)
- **Series — список** (поиск, фильтр по статусу/студии, создание).
- **Series — редактор** (метаданные, постер/баннер, жанры, статус).
- **Episodes (внутри серии)** — упорядоченный список, drag-to-reorder, публикация.
- **Episode — редактор** (загрузка видео, прогресс транскодинга, `is_free`, `released_at`, `early_unlock_cost_coins`).
- **Studios** — CRUD (2–5 записей в MVP).
- **Plans & Pricing** — редактирование подписочных планов и пакетов монет без релиза.
- **Payments** — транзакции, поиск, фильтры, действие «возврат».
- **Users — список/поиск** (по телефону, email, id; фильтры: подписчики, с балансом > 0).
- **Users — карточка** (детали, подписка, coin balance, история, действия «выдать монеты», «заблокировать», «возврат»).

**Итого MVP:** 9 hard + 2 soft = **11 экранов**.

### 9.2 Soft MVP (запускаем в минимальной форме, дорастает)
- **Dashboard** — active subs, new subs today, coin revenue today, DAU, top-10 серий.
- **Audit log** — все действия админов (actor_id, action, target, timestamp, details). Минимум — JSON-лог с поиском.

### 9.3 Вне MVP (v1.x)
- Портал самозагрузки для студий.
- Промокоды, триалы, реферальные программы.
- A/B-фреймворк.
- Автогенерация отчётов для студий (роялти).

### 9.4 Роли
- `editor` — только контент (Series/Episodes/Studios).
- `admin` — всё, включая деньги, возвраты, изменение цен, audit log.

### 9.5 Правила
- Все изменения денег и прав доступа — запись в audit log.
- Запись в БД цен — источник правды; код не содержит хардкод цен.

---

## 10. Аутентификация

- **Основной путь:** телефон + SMS OTP (6 цифр, TTL 5 мин). Шлюз — Exolve или Yandex Cloud SMS (выбор по цене).
- **OAuth:** VK ID и Yandex ID. При первом входе создаётся `users` с привязкой соответствующего id, телефон запрашиваем при первой покупке.
- **Сессии:** JWT access token (15 мин) + refresh token (30 дней) в HttpOnly cookie. Refresh хранится в `sessions`, отзыв = удаление строки.
- **Защита:** rate limit 5 попыток OTP/час на номер, Yandex SmartCaptcha после 2 неудач.
- **Анонимный просмотр** бесплатных эпизодов разрешён без аккаунта.

---

## 11. Аналитика и события

### 11.1 Пайплайн
Клиент шлёт события → API записывает в `events` (Postgres) → воркер каждые 5 мин батчами экспортирует в Amplitude (или PostHog). Свои raw-данные сохраняются для ретро-анализа.

### 11.2 Ключевые события MVP
`app_open`, `series_view`, `episode_play_start`, `episode_progress_25/50/75/100`, `paywall_shown`, `paywall_clicked`, `subscription_purchased`, `coins_purchased`, `episode_unlocked_coins`, `signup_started`, `signup_completed`, `otp_sent`, `otp_verified`.

Каждое событие имеет: `user_id` (или anonymous_id для незарегистрированных), `session_id`, `ts`, `props` (jsonb с контекстом — serie_id, episode_id, источник трафика и т.п.).

### 11.3 Метрика
- Яндекс.Метрика — маркетинговая атрибуция (UTM, источники) + Вебвизор для UX-разборов.

---

## 12. Инфраструктура и деплой

### 12.1 Окружения
- **production:** `mango-cinema.ru` (домен черновой).
- **staging:** `staging.mango-cinema.ru`, тестовые ключи ЮKassa, копия прода с уменьшенными ресурсами.
- **local:** `docker-compose` (PG + Redis + Minio + seed-данные), команда `make up`.

### 12.2 Хостинг
- **Yandex Cloud** (всё в РФ, 152-ФЗ compliant).
- **Compute:** Serverless Containers для Web / Admin / API (auto-scale по нагрузке). Ingest Worker — отдельная CPU VM на MVP (объём транскодинга ≈ 250 эпизодов на запуске справляется без GPU); GPU spot-instance добавим в v1.x, когда поток контента вырастет.
- **Managed:** Postgres 16, Redis.
- **Storage:** Object Storage (S3-compat).
- **CDN:** Yandex CDN (HLS).
- **Edge (опционально):** Cloudflare перед сайтом (WAF, DDoS, кеш HTML) — оцениваем после запуска.

### 12.3 CI/CD
- **GitHub Actions** → build Docker → push в Yandex Container Registry → deploy в Serverless Containers.
- Blue-green на staging (автомат), ручной apply на prod (первые 3 месяца после запуска).
- Health checks на `/healthz`.

### 12.4 Миграции
- pg-migrate или Drizzle Kit. Каждая миграция обратимая. Применяется автоматически при деплое бэкенда.

### 12.5 Бэкапы
- Managed PG daily backup, retention 14 дней. Восстановление тренируется перед запуском (документированный runbook).

---

## 13. Тестирование

- **Unit** (Vitest) — бизнес-логика: entitlements, coin-списания, webhook-обработчики. Цель ≥ 60% покрытия критичных модулей (Billing, Catalog).
- **Integration** (Vitest + testcontainers + реальный Postgres) — API endpoints, webhook-и, flow оплаты (ЮKassa mock). **Деньги тестируются только на реальной БД, без мокинга Postgres.**
- **E2E** (Playwright) — 4–5 сквозных сценариев: регистрация → paywall → оплата → плеер → progress. Запуск в CI на staging.
- **Без стрессов и performance-тестов на MVP.**

---

## 14. Наблюдаемость и обработка ошибок

### 14.1 Стек
- **Sentry** — ошибки фронта и бэка.
- **Grafana Cloud** (или Yandex Monitoring) — метрики, дашборды, алерты.
- **Логи** — структурированные JSON в stdout → Yandex Cloud Logging.

### 14.2 Алерты (Telegram)
- API error rate > 1% на 5-минутном окне.
- Webhook failures > 5/мин.
- Ingest queue length > 50.
- Сверка баланса монет показала расхождение.
- p95 latency `/manifest` > 500 мс.

### 14.3 Правила
- Все деньги-операции (платежи, монеты) — через очередь (pg-boss) с retry + DLQ.
- Фронт: любая unhandled ошибка → Sentry + дружелюбный экран с кнопкой «обновить».
- 5xx от бэка → retry с экспоненциальной задержкой (max 3 попытки).
- Ingest упал — статус эпизода `ingest_failed`, уведомление в админке, ручной ретрай.

---

## 15. Границы MVP (резюме «что в / что вне»)

| Область | В MVP | Вне MVP (v1.x+) |
|---|---|---|
| Платформа | Web PWA | Нативные iOS/Android |
| География | РФ | СНГ, глобал |
| Монетизация | Подписка + монеты + ранний доступ | Триалы, промокоды, рефералы |
| Контент | Админская загрузка | Портал самозагрузки студий |
| Защита | Signed URLs + watermark | Widevine/FairPlay DRM |
| Аналитика | Базовые события + Amplitude | A/B, ML-рекомендации |
| Отчётность | Ручная из админки | Автогенерация для студий |

---

## 16. Открытые вопросы

1. **Финальный выбор SMS-шлюза** — Exolve vs Yandex Cloud SMS по фактической цене за сообщение (решение в первую неделю разработки).
2. **Финальный выбор продуктовой аналитики** — Amplitude vs PostHog. Разница: Amplitude — SaaS, оплата сложнее из РФ; PostHog — можно self-host в РФ. Решение в момент выбора стека.
3. **Конкретный домен** (`mango-cinema.ru` — черновик, подлежит проверке доступности и брендинговым соображениям).
4. **Ценовой уровень** — точные цифры подписки и пакетов монет (структура зафиксирована, цифры в админке на момент запуска).

---

## 17. Следующий шаг

Этот дизайн-документ передаётся на проработку в skill `writing-plans`, который разбивает работу на пошаговый имплементационный план с конкретными задачами.
