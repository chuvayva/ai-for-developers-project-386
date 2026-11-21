# Календарь звонков

[![hexlet-check](https://github.com/chuvayva/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/chuvayva/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Как это должно работать: https://files.hexlet.app/a/2ipc5m

## Стек

- TypeScript and Vite
- UI is on Mantine
- API first with TypeSpec, OpenAPI specification

## Установка

Нужен [mise](https://mise.jdx.dev/). Он ставит Node и pnpm нужных версий из `mise.toml`.

```bash
git clone https://github.com/chuvayva/ai-for-developers-project-386.git
cd ai-for-developers-project-386
mise trust
mise install
mise run check
```

`mise run check` ставит зависимости, генерирует OpenAPI из TypeSpec, проверяет типы, запускает тесты и собирает фронтенд.

## Использование

Сервер и фронтенд запускаются в двух терминалах.

```bash
pnpm --filter @calendar/server dev   # API на http://127.0.0.1:3000
pnpm --filter @calendar/web dev      # интерфейс на http://localhost:5173
```

Контракт API описан в `api/main.tsp`. Команда `pnpm --filter @calendar/api build` собирает из него `api/generated/openapi.yaml` и типы TypeScript для сервера и фронтенда.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
