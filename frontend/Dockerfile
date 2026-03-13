# frontend/Dockerfile

# === БАЗОВАЯ СТАДИЯ ===
# Общие настройки для всех стадий
FROM node:20-alpine AS base

WORKDIR /app

# Копируем файлы с зависимостями (для кэширования)
COPY package.json package-lock.json ./

# === СТАДИЯ ДЛЯ РАЗРАБОТКИ ===
FROM base AS development

# Устанавливаем зависимости
RUN npm ci

# Копируем весь код (будет перезаписан volume в разработке)
COPY . .

# Запускаем dev-сервер Vite с hot reload
# --host 0.0.0.0 нужен для доступа извне контейнера
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# === СТАДИЯ ДЛЯ СБОРКИ (промежуточная) ===
FROM base AS build

# Устанавливаем зависимости
RUN npm ci

# Копируем весь код
COPY . .

# Собираем production-сборку
RUN npm run build

# === СТАДИЯ ДЛЯ ПРОДАКШНА ===
FROM nginx:alpine AS production

# Копируем собранные файлы из стадии build
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx (если есть кастомная)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]