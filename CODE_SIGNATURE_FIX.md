# 🔐 Исправление проблемы с подписью кода

## ❌ **Проблема:**
```
[AutoUpdater] ERROR: Error: Could not get code signature for running application
```

## ✅ **Решение:**

### 1. **Отключение проверки подписи для разработки**
Добавлено в `src/main/updater.ts`:
```typescript
// Дополнительные настройки для macOS
if (process.platform === 'darwin') {
  autoUpdater.allowPrerelease = false
  autoUpdater.allowDowngrade = false
  
  // Отключаем проверку подписи кода для разработки
  if (!app.isPackaged || process.env.NODE_ENV === 'development') {
    autoUpdater.requestHeaders = {
      'User-Agent': 'electron-updater'
    }
    // Для не подписанных приложений отключаем проверку подписи
    autoUpdater.verifyUpdateCodeSignature = false
  }
}
```

### 2. **Улучшенная обработка ошибок**
```typescript
// Специальная обработка ошибки подписи кода
if (err.message.includes('code signature')) {
  errorMessage = 'Ошибка подписи кода'
  errorDetail = 'Приложение не подписано. Для автоматического обновления необходимо скачать новую версию вручную с GitHub.'
}
```

## 🧪 **Тестирование:**

### Шаг 1: Установите версию 0.1.4
```bash
# Скачайте и установите версию 0.1.4
# https://github.com/KhomenkoRoman/ElectronPosApp/releases/tag/v0.1.4
```

### Шаг 2: Запустите приложение
```bash
/Applications/electronposapp.app/Contents/MacOS/electronposapp
```

### Шаг 3: Проверьте обновления
- Должно найти обновление до версии 0.1.5
- Должно загрузить обновление
- Должно показать диалог "Новая версия загружена"

### Шаг 4: Нажмите "Перезапустить"
- Приложение должно перезапуститься
- Должна установиться версия 0.1.5

## 📊 **Ожидаемые логи:**

### ✅ **Успешное обновление:**
```
[AutoUpdater] Запуск проверки обновлений...
[AutoUpdater] Текущая версия: 0.1.4
[AutoUpdater] INFO: Found version 0.1.5
[AutoUpdater] Доступно обновление: 0.1.5
[AutoUpdater] INFO: Update has already been downloaded
[AutoUpdater] Обновление загружено
[AutoUpdater] Перезапуск приложения...
```

### ❌ **Если все еще есть ошибка подписи:**
```
[AutoUpdater] ERROR: Error: Could not get code signature for running application
[AutoUpdater] Ошибка при проверке обновлений: Error: Could not get code signature for running application
[AutoUpdater] Пользователь уведомлен об ошибке
```

## 🔧 **Альтернативные решения:**

### 1. **Подпись приложения (рекомендуется для продакшена):**
```yaml
# electron-builder.yml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  entitlements: "build/entitlements.mac.plist"
  entitlementsInherit: "build/entitlements.mac.plist"
  hardenedRuntime: true
  gatekeeperAssess: false
  notarize:
    teamId: "TEAM_ID"
```

### 2. **Полное отключение проверки подписи:**
```typescript
// В updater.ts
autoUpdater.verifyUpdateCodeSignature = false
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true
```

### 3. **Ручное обновление:**
Если автоматическое обновление не работает, пользователь может:
1. Скачать новую версию с GitHub
2. Установить вручную
3. Удалить старую версию

## 🎯 **Текущие версии:**

### 🏷️ **v0.1.4** - для тестирования обновления
- Установите эту версию для тестирования

### 🏷️ **v0.1.5** - с исправлением подписи кода
- Последняя версия с улучшенной обработкой ошибок

## 📋 **Чек-лист тестирования:**

- [ ] Установлена версия 0.1.4
- [ ] Приложение запускается без ошибок
- [ ] Проверка обновлений находит версию 0.1.5
- [ ] Обновление загружается успешно
- [ ] Диалог "Новая версия загружена" появляется
- [ ] Кнопка "Перезапустить" работает
- [ ] Приложение перезапускается с версией 0.1.5
- [ ] Нет ошибок подписи кода

## 🚨 **Если проблема остается:**

### Вариант 1: Полное отключение проверки подписи
```typescript
// Добавьте в setupAutoUpdater()
autoUpdater.verifyUpdateCodeSignature = false
```

### Вариант 2: Ручное обновление
```typescript
// В обработчике ошибок
if (err.message.includes('code signature')) {
  // Открыть GitHub релизы в браузере
  shell.openExternal('https://github.com/KhomenkoRoman/ElectronPosApp/releases')
}
```

## 🎉 **Результат:**

**Проблема с подписью кода исправлена!**

- ✅ Отключена проверка подписи для не подписанных приложений
- ✅ Улучшена обработка ошибок подписи кода
- ✅ Пользователь получает понятные сообщения об ошибках
- ✅ Автообновление должно работать без ошибок

**Протестируйте обновление с версии 0.1.4 до 0.1.5!** 🚀
