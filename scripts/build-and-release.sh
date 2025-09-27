#!/bin/bash

# Скрипт для локальной сборки и публикации релиза на GitHub
# Использование: ./scripts/build-and-release.sh [версия] [платформа]
# Пример: ./scripts/build-and-release.sh 1.0.0 mac
# Платформы: mac, win, linux, all

set -e

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

# Проверяем, что мы в чистом состоянии git
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Ошибка: Рабочая директория не чистая. Зафиксируйте все изменения перед публикацией."
    exit 1
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

# Собираем приложение локально
echo "🔨 Собираем приложение локально..."

if [ "$PLATFORM" = "all" ]; then
    echo "📦 Сборка для всех платформ..."
    npm run build:mac
    npm run build:win
    npm run build:linux
elif [ "$PLATFORM" = "mac" ]; then
    echo "🍎 Сборка для macOS..."
    npm run build:mac
elif [ "$PLATFORM" = "win" ]; then
    echo "🪟 Сборка для Windows..."
    npm run build:win
elif [ "$PLATFORM" = "linux" ]; then
    echo "🐧 Сборка для Linux..."
    npm run build:linux
else
    echo "❌ Неизвестная платформа: $PLATFORM"
    echo "Доступные платформы: mac, win, linux, all"
    exit 1
fi

echo "✅ Сборка завершена!"
echo "📁 Файлы сборки находятся в папке dist/"

# Публикуем релиз на GitHub
echo "📢 Публикуем релиз на GitHub..."

if [ "$PLATFORM" = "all" ]; then
    # Публикуем для всех платформ
    npm run release
else
    # Публикуем для конкретной платформы
    if [ "$PLATFORM" = "mac" ]; then
        npm run release:mac
    elif [ "$PLATFORM" = "win" ]; then
        npm run release:win
    elif [ "$PLATFORM" = "linux" ]; then
        npm run release:linux
    fi
fi

echo "🎉 Релиз v$VERSION успешно опубликован!"
echo "🔗 Проверьте релиз: https://github.com/KhomenkoRoman/ElectronPosApp/releases"
echo "📋 Проверьте статус: https://github.com/KhomenkoRoman/ElectronPosApp/actions"
