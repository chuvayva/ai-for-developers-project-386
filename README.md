# Календарь звонков

[![hexlet-check](https://github.com/chuvayva/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/chuvayva/ai-for-developers-project-386/actions)

Разработайте совместно с ИИ сервис для бронирования календаря

Как это должно работать: https://files.hexlet.app/a/2ipc5m

Приложение опубликовано на Render: https://calendar-hvga.onrender.com

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
mise run setup
mise run check
```

`mise run setup` ставит зависимости и git-хуки. `mise run check` запускает линтер и форматтер, генерирует OpenAPI из TypeSpec, проверяет типы, запускает тесты и собирает фронтенд. Ту же команду запускает CI.

## Использование

Одна команда запускает сервер и фронтенд вместе, `Ctrl+C` останавливает оба.

```bash
mise run dev      # API на http://127.0.0.1:3000 и интерфейс на http://localhost:5173
```

Их можно запустить и по отдельности.

```bash
mise run server   # только API
mise run web      # только интерфейс
```

Проверить, что сервер отвечает:

```bash
curl http://127.0.0.1:3000/api/health   # {"status":"ok"}
```

Контракт API описан в `api/main.tsp`. Команда `pnpm --filter @calendar/api build` собирает из него `api/generated/openapi.yaml` и типы TypeScript для сервера и фронтенда.

## Docker

`Dockerfile` собирает один образ. В нём сервер отдаёт API под `/api` и собранный интерфейс на всех остальных путях, на одном порту из переменной `PORT`.

```bash
docker build -t calendar .
docker run --rm -e PORT=8080 -p 8080:8080 calendar   # http://localhost:8080
```

## Деплой

Сервис `calendar` на Render собирается из `Dockerfile` в ветке `main`. Каждый push в `main` запускает новый деплой. Render передаёт порт в `PORT` и проверяет `/api/health`. Настройки сервиса описаны в `render.yaml`.

### Хранение данных

Типы событий и бронирования хранятся в памяти процесса, базы данных нет. Перезапуск, новый деплой и засыпание бесплатного инстанса Render после 15 минут без запросов удаляют все данные. После засыпания первый запрос будит сервис, и ответ приходит примерно через минуту.

### MCP-сервер Render

`.mcp.json` подключает к Claude Code MCP-сервер Render `https://mcp.render.com/mcp`. Через него агент смотрит сервисы, деплои и логи. Вход через OAuth с Claude Code не работает, поэтому сервер берёт API-ключ из переменной окружения `RENDER_API_KEY`. Ключа в репозитории нет.

1. Создайте API-ключ в Render: Account Settings, API Keys (https://dashboard.render.com/u/settings#api-keys).
2. Задайте его в окружении, из которого запускаете Claude Code, например в `~/.zshrc`:

   ```bash
   export RENDER_API_KEY=<ваш ключ>
   ```

3. Откройте новый терминал и запустите Claude Code в папке проекта. Одобрите сервер `render` из `.mcp.json`, когда Claude Code спросит.
4. Проверьте подключение командой `/mcp`: у `render` должен быть статус connected. Затем попросите агента выбрать рабочее пространство Render, в котором живёт сервис.

---

<details>
<summary>Автоматические тесты Хекслета</summary>

Тесты запускаются на каждый коммит. За запуск отвечает файл `.github/workflows/hexlet-check.yml` — не удаляйте и не переименовывайте ни его, ни репозиторий.

</details>

## О Хекслете

[Хекслет](https://ru.hexlet.io/) — школа программирования: авторские программы обучения с практикой, поддержкой наставников и реальными проектами, которые остаются в резюме. Этот репозиторий — один из таких проектов.
