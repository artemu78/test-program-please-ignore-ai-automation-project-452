# Автоматизация записи на консультацию

Serverless-функция принимает POST-заявку с именем, почтой, темой и временем ISO 8601 с часовым поясом. Она проверяет рабочее время по Москве, выбирает консультанта по теме и создаёт событие CalDAV с приглашёнными клиентом и консультантом.

## Локальная проверка

Требуется Node.js 22 или новее.

```bash
npm ci
make lint
make test
```

Формат заявки:

```json
{"name":"Мария","email":"maria@example.com","topic":"frontend","time":"2026-11-17T12:00:00+03:00"}
```

Ответы: `201` с `consultant`, `start`, `end`; `400` при неверной заявке; `422` при неподходящей теме или времени; `502` при отказе календаря. `OPTIONS` возвращает `204` и CORS-заголовки.

## Развёртывание

Нужны настроенные `yc` и Яндекс Календарь. Один раз создайте публичную функцию:

```bash
yc serverless function create --name booking
yc serverless function allow-unauthenticated-invoke booking
```

Создайте пароль приложения CalDAV и задайте переменные окружения в терминале (не добавляйте их в репозиторий): `CALDAV_URL` — адрес календаря с завершающим `/`, `CALDAV_USER` — логин Яндекс ID, `CALDAV_PASSWORD` — пароль приложения. Затем выполните `make deploy`. Адрес функции: `yc serverless function get booking`, поле `http_invoke_url`.

```bash
curl -X POST 'https://functions.yandexcloud.net/<id>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Мария","email":"maria@example.com","topic":"frontend","time":"2026-11-17T12:00:00+03:00"}'
```

Проверка формы на сайте школы и доставки письма выполняется после развёртывания с реальным календарём.
