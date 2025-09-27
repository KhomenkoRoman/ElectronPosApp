# 🔍 Диагностика автообновления

## Что было исправлено

### 1. ✅ **Добавлена конфигурация publish в electron-builder.yml**
```yaml
publish:
  provider: github
  owner: KhomenkoRoman
  repo: ElectronPosApp
```

### 2. ✅ **Улучшена диагностика автообновления**
- Подробное логирование всех событий
- Информация о URL, настройках и ошибках
- Отображение результатов проверки обновлений

### 3. ✅ **Добавлена кнопка "Проверить обновления"**
- Ручная проверка обновлений через UI
- Индикатор загрузки
- Логирование в консоль

## Как диагностировать проблемы

### Шаг 1: Запустите приложение
```bash
npm run dev
```

### Шаг 2: Откройте DevTools
- Нажмите F12
- Перейдите во вкладку Console

### Шаг 3: Нажмите кнопку "Проверить обновления"
- В UI появится кнопка "Проверить обновления"
- Нажмите на неё

### Шаг 4: Проверьте логи в консоли
Должны появиться сообщения:

#### ✅ **Успешная проверка:**
```
[AutoUpdater] Ручная проверка обновлений...
[AutoUpdater] Запуск проверки обновлений...
[AutoUpdater] Текущая версия: 0.1.0
[AutoUpdater] Feed URL: https://github.com/KhomenkoRoman/ElectronPosApp/releases/latest/download/latest-mac.yml
[AutoUpdater] Auto Download: true
[AutoUpdater] Auto Install on Quit: true
[AutoUpdater] INFO: Checking for updates...
[AutoUpdater] INFO: Update available: 0.1.1
[AutoUpdater] Доступно обновление: 0.1.1
```

#### ❌ **Ошибка сети:**
```
[AutoUpdater] ERROR: Error: net::ERR_INTERNET_DISCONNECTED
[AutoUpdater] Ошибка при проверке обновлений: Error: net::ERR_INTERNET_DISCONNECTED
```

#### ❌ **Ошибка 404:**
```
[AutoUpdater] ERROR: Error: HTTP 404: Not Found
[AutoUpdater] Ошибка при проверке обновлений: Error: HTTP 404: Not Found
```

## Возможные проблемы и решения

### 1. **"Feed URL: undefined"**
**Проблема**: Не настроена конфигурация publish
**Решение**: Убедитесь, что в `electron-builder.yml` есть секция publish

### 2. **"HTTP 404: Not Found"**
**Проблема**: Файл `latest-mac.yml` не найден в релизе
**Решение**: Проверьте, что файл загружен в релиз на GitHub

### 3. **"Update not available"**
**Проблема**: Нет новой версии для обновления
**Решение**: Создайте новую версию с помощью скрипта

### 4. **"Error: net::ERR_INTERNET_DISCONNECTED"**
**Проблема**: Нет интернет-соединения
**Решение**: Проверьте подключение к интернету

### 5. **"Error: EACCES: permission denied"**
**Проблема**: Нет прав на запись в папку приложения
**Решение**: Запустите приложение с правами администратора

## Тестирование автообновления

### Создайте новую версию для тестирования:
```bash
./scripts/build-and-release.sh 0.1.1 mac
```

### Проверьте файлы в релизе:
```bash
gh release view v0.1.1
```

Должны быть файлы:
- `electronposapp-0.1.1.dmg`
- `electronposapp-0.1.1-mac.zip`
- `latest-mac.yml`

### Проверьте содержимое latest-mac.yml:
```bash
curl https://github.com/KhomenkoRoman/ElectronPosApp/releases/download/v0.1.1/latest-mac.yml
```

## Проверка URL автообновления

### Правильный URL должен быть:
```
https://github.com/KhomenkoRoman/ElectronPosApp/releases/download/v0.1.1/latest-mac.yml
```

### Проверьте доступность:
```bash
curl -I https://github.com/KhomenkoRoman/ElectronPosApp/releases/download/v0.1.1/latest-mac.yml
```

Должен вернуть статус 200 OK.

## Логи для отладки

### Включите подробное логирование:
1. Откройте DevTools (F12)
2. Перейдите в Console
3. Ищите сообщения с префиксом `[AutoUpdater]`

### Основные события для отслеживания:
- `checking-for-update` - начало проверки
- `update-available` - найдено обновление
- `update-not-available` - обновлений нет
- `download-progress` - прогресс загрузки
- `update-downloaded` - обновление загружено
- `error` - ошибка

## Команды для диагностики

```bash
# Проверить релизы
gh release list

# Посмотреть конкретный релиз
gh release view v0.1.1

# Проверить доступность файла
curl -I https://github.com/KhomenkoRoman/ElectronPosApp/releases/download/v0.1.1/latest-mac.yml

# Создать новую версию для тестирования
./scripts/build-and-release.sh 0.1.2 mac
```

## Результат диагностики

После исправлений автообновление должно:
- ✅ Правильно определять URL для проверки
- ✅ Находить доступные обновления
- ✅ Загружать новые версии
- ✅ Показывать уведомления
- ✅ Корректно перезапускаться

**Если проблемы остаются, проверьте логи в консоли для детальной диагностики!** 🔍
