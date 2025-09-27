import { dialog } from 'electron'
import { autoUpdater } from 'electron-updater'

/**
 * Настройка и инициализация автообновления
 */
export function setupAutoUpdater(): void {
  // Настройка автообновления
  autoUpdater.checkForUpdatesAndNotify = false // Отключаем автоматические уведомления
  autoUpdater.autoDownload = true // Автоматически загружаем обновления
  autoUpdater.autoInstallOnAppQuit = true // Автоматически устанавливаем при выходе
  
  // Логирование для отладки
  autoUpdater.logger = {
    info: (message: string) => console.log('[AutoUpdater] INFO:', message),
    warn: (message: string) => console.warn('[AutoUpdater] WARN:', message),
    error: (message: string) => console.error('[AutoUpdater] ERROR:', message)
  }
  // Обработчик проверки обновлений
  autoUpdater.on('checking-for-update', () => {
    console.log('Проверка обновлений...')
  })

  // Обработчик доступного обновления
  autoUpdater.on('update-available', (info) => {
    console.log('Доступно обновление:', info.version)
  })

  // Обработчик отсутствия обновлений
  autoUpdater.on('update-not-available', () => {
    console.log('Обновления не найдены')
  })

  // Обработчик ошибок
  autoUpdater.on('error', (err) => {
    console.error('Ошибка при проверке обновлений:', err)
  })

  // Обработчик прогресса загрузки
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Скорость загрузки: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Загружено ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    console.log(log_message)
  })

  // Обработчик завершения загрузки
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Обновление загружено')

    const dialogOpts = {
      type: 'info' as const,
      buttons: ['Перезапустить', 'Позже'],
      title: 'Обновление приложения',
      message: 'Новая версия загружена',
      detail: `Версия ${info.version} готова к установке. Перезапустите приложение для применения обновлений.`
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
}

/**
 * Запуск проверки обновлений
 */
export function checkForUpdates(): void {
  console.log('[AutoUpdater] Запуск проверки обновлений...')
  console.log('[AutoUpdater] Текущая версия:', autoUpdater.currentVersion)
  
  autoUpdater.checkForUpdates().catch((error) => {
    console.error('[AutoUpdater] Ошибка при проверке обновлений:', error)
  })
}

/**
 * Получение текущей версии приложения
 */
export function getCurrentVersion(): string {
  return autoUpdater.currentVersion.version
}
