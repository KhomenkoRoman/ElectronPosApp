import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

/**
 * Настройка и инициализация автообновления
 */
export function setupAutoUpdater(): void {
  // Настройка автообновления - полностью автоматический режим
  autoUpdater.autoDownload = true // Автоматически загружаем обновления
  autoUpdater.autoInstallOnAppQuit = true // Автоматически устанавливаем при выходе

  // Разрешаем проверку обновлений в режиме разработки
  autoUpdater.forceDevUpdateConfig = true

  // Настраиваем URL для GitHub релизов
  const updateUrl = 'https://github.com/KhomenkoRoman/ElectronPosApp/releases/latest/download/'
  autoUpdater.setFeedURL(updateUrl)

  // Дополнительные настройки для macOS
  if (process.platform === 'darwin') {
    autoUpdater.allowPrerelease = false
    autoUpdater.allowDowngrade = false
    autoUpdater.requestHeaders = {
      'User-Agent': 'electron-updater'
    }
  }

  // Минимальное логирование
  autoUpdater.logger = {
    info: (message: string) => console.log('[AutoUpdater]', message),
    warn: (message: string) => console.warn('[AutoUpdater]', message),
    error: (message: string) => console.error('[AutoUpdater]', message)
  }
  // Обработчик проверки обновлений
  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Проверка обновлений...')
  })

  // Обработчик доступного обновления
  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Доступно обновление:', info.version)
  })

  // Обработчик отсутствия обновлений
  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] Обновления не найдены, версия актуальна')
  })

  // Обработчик ошибок
  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Ошибка:', err.message)
  })

  // Обработчик прогресса загрузки
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`[AutoUpdater] Загрузка: ${Math.round(progressObj.percent)}%`)
  })

  // Обработчик завершения загрузки - автоматическая установка
  autoUpdater.on('update-downloaded', () => {
    console.log('[AutoUpdater] Обновление загружено, перезапуск через 3 секунды...')

    // Автоматический перезапуск через 3 секунды
    setTimeout(() => {
      console.log('[AutoUpdater] Установка обновления...')
      autoUpdater.quitAndInstall(true, true)
    }, 3000)
  })
}

/**
 * Автоматическая проверка обновлений при запуске (с уведомлением только при наличии новой версии)
 */
export function checkForUpdates(): void {
  console.log('[AutoUpdater] Автоматическая проверка обновлений...')

  // Удаляем все обработчики событий для автоматической проверки
  autoUpdater.removeAllListeners('update-available')
  autoUpdater.removeAllListeners('update-not-available')
  autoUpdater.removeAllListeners('error')

  // Добавляем обработчики для автоматической проверки
  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Найдено обновление:', info.version)

    // Показываем диалог с выбором действия
    dialog
      .showMessageBox({
        type: 'info',
        buttons: ['Загрузить сейчас', 'Позже'],
        title: 'Доступно обновление',
        message: 'Найдена новая версия приложения',
        detail: `Версия ${info.version} готова к загрузке. Хотите загрузить и установить обновление сейчас?`
      })
      .then((result) => {
        if (result.response === 0) {
          // Пользователь выбрал "Загрузить сейчас"
          console.log('[AutoUpdater] Пользователь выбрал загрузку сейчас')
          // Обновление уже загружается автоматически, просто ждем завершения
        } else {
          // Пользователь выбрал "Позже"
          console.log('[AutoUpdater] Пользователь отложил обновление')
          // Отменяем автоматическую загрузку
          autoUpdater.autoDownload = false
        }
      })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] Версия актуальна')
    // Никаких уведомлений при актуальной версии
  })

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Ошибка:', err.message)
    // Никаких уведомлений об ошибках при автоматической проверке
  })

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('[AutoUpdater] Ошибка:', error.message)
  })
}

/**
 * Получение текущей версии приложения
 */
export function getCurrentVersion(): string {
  return autoUpdater.currentVersion.version
}

/**
 * Ручная проверка обновлений (с уведомлениями пользователю)
 */
export function manualCheckForUpdates(): void {
  console.log('[AutoUpdater] Ручная проверка обновлений...')

  // Удаляем все обработчики событий
  autoUpdater.removeAllListeners('update-available')
  autoUpdater.removeAllListeners('update-not-available')
  autoUpdater.removeAllListeners('error')

  // Добавляем обработчики с уведомлениями
  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Доступно обновление:', info.version)

    // Показываем уведомление о доступном обновлении
    dialog
      .showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Обновление доступно',
        message: 'Найдена новая версия приложения',
        detail: `Версия ${info.version} будет загружена и установлена автоматически.`
      })
      .then(() => {
        console.log('[AutoUpdater] Пользователь уведомлен о доступном обновлении')
      })
  })

  autoUpdater.on('update-not-available', () => {
    console.log('[AutoUpdater] Обновления не найдены')

    // Показываем уведомление о том, что версия актуальна
    dialog
      .showMessageBox({
        type: 'info',
        buttons: ['OK'],
        title: 'Проверка обновлений',
        message: 'Установлена актуальная версия',
        detail: 'У вас установлена последняя доступная версия приложения.'
      })
      .then(() => {
        console.log('[AutoUpdater] Пользователь уведомлен о актуальной версии')
      })
  })

  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Ошибка при проверке обновлений:', err)

    // Показываем уведомление об ошибке
    dialog
      .showMessageBox({
        type: 'error',
        buttons: ['OK'],
        title: 'Ошибка проверки обновлений',
        message: 'Не удалось проверить обновления',
        detail: `Ошибка: ${err.message}. Проверьте подключение к интернету и попробуйте позже.`
      })
      .then(() => {
        console.log('[AutoUpdater] Пользователь уведомлен об ошибке')
      })
  })

  autoUpdater.checkForUpdates().catch((error) => {
    console.error('[AutoUpdater] Ошибка:', error.message)
  })
}
