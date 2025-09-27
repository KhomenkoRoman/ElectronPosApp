#!/bin/bash

# Скрипт для локальной сборки и публикации релиза на GitHub
# Использование: ./scripts/build-and-release.sh [версия] [платформа]
# Пример: ./scripts/build-and-release.sh 1.0.0 mac
# Платформы: mac, win, linux, all

set -e

# Функция очистки при выходе (если понадобится в будущем)
cleanup() {
    echo "🧹 Очистка завершена"
}

# Загружаем переменные окружения из .env файла
if [ -f ".env" ]; then
    echo "📋 Загружаем переменные окружения из .env файла..."
    export $(grep -v '^#' .env | xargs)
    
    # Проверяем, что токен загружен
    if [ -z "$GH_TOKEN" ]; then
        echo "⚠️  GH_TOKEN не найден в .env файле"
    else
        echo "✅ GitHub токен загружен"
    fi
fi

# Проверяем, что версия передана
if [ -z "$1" ]; then
    echo "❌ Ошибка: Необходимо указать версию"
    echo "Использование: $0 [версия] [платформа]"
    echo "Пример: $0 1.0.0 mac"
    echo "Платформы: mac, win, linux, all"
    exit 1
fi

VERSION=$1
PLATFORM=${2:-all}

echo "🚀 Начинаем сборку и публикацию релиза версии $VERSION для платформы $PLATFORM"

# Проверяем состояние git и автоматически исправляем
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Рабочая директория не чистая. Автоматически исправляем..."
    
    # Добавляем изменения, исключая .env файл
    echo "📝 Добавляем изменения в git (исключая .env)..."
    git add .
    git reset .env
    
    # Проверяем, что есть изменения для коммита
    if [ -n "$(git diff --cached --name-only)" ]; then
        echo "💾 Создаем коммит с изменениями..."
        git commit -m "chore: prepare for release $VERSION"
        echo "✅ Изменения зафиксированы автоматически"
    else
        echo "ℹ️  Нет изменений для коммита"
    fi
    
    # Финальная проверка
    if [ -n "$(git status --porcelain)" ]; then
        echo "❌ Ошибка: Не удалось очистить рабочую директорию. Проверьте состояние git вручную."
        git status
        exit 1
    fi
else
    echo "✅ Рабочая директория чистая"
fi

# Проверяем, что мы на ветке main или master
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo "❌ Ошибка: Публикация возможна только с ветки main или master"
    echo "Текущая ветка: $CURRENT_BRANCH"
    exit 1
fi

# Обновляем версию в package.json
echo "📝 Обновляем версию в package.json..."
npm version $VERSION --no-git-tag-version

# Создаем коммит с обновленной версией
echo "💾 Создаем коммит с обновленной версией..."
git add package.json
git commit -m "chore: bump version to $VERSION"

# Создаем тег
echo "🏷️  Создаем тег v$VERSION..."
git tag "v$VERSION"

# Отправляем изменения и тег
echo "📤 Отправляем изменения и тег на GitHub..."
git push origin $CURRENT_BRANCH
git push origin "v$VERSION"

# Убеждаемся, что переменные окружения загружены перед сборкой
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Собираем приложение локально и публикуем
echo "🔨 Собираем приложение локально и публикуем..."

if [ "$PLATFORM" = "all" ]; then
    echo "📦 Сборка и публикация для всех платформ..."
    npm run release
elif [ "$PLATFORM" = "mac" ]; then
    echo "🍎 Сборка и публикация для macOS..."
    npm run release:mac
elif [ "$PLATFORM" = "win" ]; then
    echo "🪟 Сборка и публикация для Windows..."
    npm run release:win
elif [ "$PLATFORM" = "linux" ]; then
    echo "🐧 Сборка и публикация для Linux..."
    npm run release:linux
else
    echo "❌ Неизвестная платформа: $PLATFORM"
    echo "Доступные платформы: mac, win, linux, all"
    exit 1
fi

echo "✅ Сборка и публикация завершены!"
echo "📁 Файлы сборки находятся в папке dist/"

echo "🎉 Релиз v$VERSION успешно опубликован!"
echo "🔗 Проверьте релиз: https://github.com/KhomenkoRoman/ElectronPosApp/releases"
echo "📋 Проверьте статус: https://github.com/KhomenkoRoman/ElectronPosApp/actions"
