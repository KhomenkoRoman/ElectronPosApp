# Настройка GitHub Personal Access Token

## Проблема
```
GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"
```

## Решение

### 1. Создайте Personal Access Token на GitHub

1. Перейдите в [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Нажмите "Generate new token" → "Generate new token (classic)"
3. Заполните форму:
   - **Note**: `ElectronPosApp Release Token`
   - **Expiration**: Выберите срок действия (рекомендуется 90 days)
   - **Scopes**: Отметьте следующие права:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)
     - ✅ `read:packages` (Download packages from GitHub Package Registry)

4. Нажмите "Generate token"
5. **ВАЖНО**: Скопируйте токен сразу, он больше не будет показан!

### 2. Настройте токен в системе

#### Вариант A: Экспорт переменной окружения (рекомендуется)

```bash
# Добавьте в ~/.zshrc или ~/.bashrc
export GH_TOKEN="your_token_here"

# Перезагрузите профиль
source ~/.zshrc
# или
source ~/.bashrc
```

#### Вариант B: Создайте .env файл

```bash
# Создайте файл .env в корне проекта
echo "GH_TOKEN=your_token_here" >> .env
```

#### Вариант C: Установите GitHub CLI

```bash
# Установите GitHub CLI
brew install gh

# Авторизуйтесь
gh auth login

# Выберите:
# - GitHub.com
# - HTTPS
# - Login with a web browser
# - Follow prompts
```

### 3. Проверьте настройку

```bash
# Проверьте переменную окружения
echo $GH_TOKEN

# Или через GitHub CLI
gh auth status
```

### 4. Теперь можете создавать релизы

```bash
# Для macOS
./scripts/build-and-release.sh 0.0.1 mac

# Для всех платформ
./scripts/build-and-release.sh 0.0.1 all
```

## Безопасность

⚠️ **Важные моменты:**

1. **Никогда не коммитьте токен в git!**
2. Добавьте `.env` в `.gitignore`
3. Используйте минимально необходимые права
4. Регулярно обновляйте токены
5. Удаляйте неиспользуемые токены

## Альтернативный способ (без токена)

Если не хотите использовать токен, можете:

1. Собрать приложение локально:
   ```bash
   npm run build:mac
   npm run build:win
   npm run build:linux
   ```

2. Вручную загрузить файлы из папки `dist/` в релиз на GitHub

## Troubleshooting

### Токен не работает
- Проверьте права токена (должен быть `repo`)
- Убедитесь, что токен не истек
- Проверьте правильность переменной окружения

### Ошибка 401 Unauthorized
- Токен неверный или истек
- Недостаточно прав у токена

### Ошибка 403 Forbidden
- Токен не имеет прав на запись в репозиторий
- Репозиторий приватный, а токен не имеет доступа
