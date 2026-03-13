# backend/Dockerfile

# === БАЗОВАЯ СТАДИЯ ===
# Содержит общие для всех стадий инструкции
FROM python:3.11-slim AS base

# Устанавливаем uv (менеджер пакетов)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы с зависимостями
COPY pyproject.toml uv.lock ./

# === СТАДИЯ ДЛЯ РАЗРАБОТКИ ===
FROM base AS development

# Устанавливаем ВСЕ зависимости (включая dev, без --no-dev)
RUN uv sync
ENV PATH="/app/.venv/bin:$PATH"

# Копируем весь код (но он будет перезаписан volume в разработке)
COPY . .

# Команда для разработки с горячей перезагрузкой
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# === СТАДИЯ ДЛЯ ПРОДАКШНА ===
FROM base AS production

# Устанавливаем ТОЛЬКО основные зависимости (с флагом --no-dev)
RUN uv sync --no-dev
ENV PATH="/app/.venv/bin:$PATH"

# Копируем только необходимый код (без тестов и лишнего)
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./scripts ./scripts

# Команда для продакшна (без --reload)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]