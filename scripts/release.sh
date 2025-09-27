#!/bin/bash

# Скрипт для публикации релиза на GitHub
# Использование: ./scripts/release.sh [версия]
# Пример: ./scripts/release.sh 1.0.0

set -e

# Проверяем, что версия передана
if [ -z "$1" ]; then
    echo "Ошибка: Необходимо указать версию"
    echo "Использование: $0 [версия]"
    echo "Пример: $0 1.0.0"
    exit 1
fi

VERSION=$1

echo "🚀 Начинаем публикацию релиза версии $VERSION"

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

echo "✅ Релиз v$VERSION успешно опубликован!"
echo "🔗 GitHub Actions автоматически соберет и опубликует релиз"
echo "📋 Проверьте статус: https://github.com/KhomenkoRoman/ElectronPosApp/actions"
