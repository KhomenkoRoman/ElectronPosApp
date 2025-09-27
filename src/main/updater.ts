import { dialog, app, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import { exec } from 'child_process'

/**
 * Настройка и инициализация автообновления
 */
export function setupAutoUpdater(): void {
  // Настройка автообновления
  autoUpdater.checkForUpdatesAndNotify = false // Отключаем автоматические уведомления
  autoUpdater.autoDownload = true // Автоматически загружаем обновления
  autoUpdater.autoInstallOnAppQuit = true // Автоматически устанавливаем при выходе
  
  // Разрешаем проверку обновлений в режиме разработки (для тестирования)
  autoUpdater.forceDevUpdateConfig = true
  
  // Программно настраиваем URL для GitHub релизов (без имени файла)
  const updateUrl = 'https://github.com/KhomenkoRoman/ElectronPosApp/releases/latest/download/'
  autoUpdater.setFeedURL(updateUrl)
  
          // Дополнительные настройки для macOS
          if (process.platform === 'darwin') {
            autoUpdater.allowPrerelease = false // Только стабильные релизы
            autoUpdater.allowDowngrade = false // Не разрешаем откат версий
            
            // Полностью отключаем проверку подписи кода для всех случаев
            autoUpdater.verifyUpdateCodeSignature = false
            autoUpdater.requestHeaders = {
              'User-Agent': 'electron-updater'
            }
          }
  
  // Логирование для отладки
  autoUpdater.logger = {
    info: (message: string) => console.log('[AutoUpdater] INFO:', message),
    warn: (message: string) => console.warn('[AutoUpdater] WARN:', message),
    error: (message: string) => console.error('[AutoUpdater] ERROR:', message)
  }
  // Обработчик проверки обновлений
  autoUpdater.on('checking-for-update', () => {
    console.log('[AutoUpdater] Проверка обновлений...')
  })

  // Обработчик доступного обновления
  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Доступно обновление:', info.version)
    console.log('[AutoUpdater] Информация об обновлении:', JSON.stringify(info, null, 2))
  })

  // Обработчик отсутствия обновлений
  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Обновления не найдены')
    console.log('[AutoUpdater] Текущая версия:', info.version)
    
    // Показываем уведомление пользователю
    const dialogOpts = {
      type: 'info' as const,
      buttons: ['OK'],
      title: 'Проверка обновлений',
      message: 'Установлена актуальная версия',
      detail: `Версия ${info.version} является последней доступной версией.`
    }

    dialog.showMessageBox(dialogOpts).then(() => {
      console.log('[AutoUpdater] Пользователь уведомлен о актуальной версии')
    })
  })

  // Обработчик ошибок
  autoUpdater.on('error', (err) => {
    console.error('[AutoUpdater] Ошибка при проверке обновлений:', err)
    console.error('[AutoUpdater] Детали ошибки:', err.message)
    console.error('[AutoUpdater] Stack trace:', err.stack)
    
    // Показываем уведомление пользователю об ошибке
    let errorMessage = err.message
    let errorDetail = `Ошибка: ${err.message}. Проверьте подключение к интернету и попробуйте позже.`
    
    // Специальная обработка ошибки подписи кода
    if (err.message.includes('code signature')) {
      errorMessage = 'Ошибка подписи кода'
      errorDetail = 'Приложение не подписано. Для автоматического обновления необходимо скачать новую версию вручную с GitHub.'
    }
    
    const dialogOpts = {
      type: 'error' as const,
      buttons: ['OK'],
      title: 'Ошибка проверки обновлений',
      message: 'Не удалось проверить обновления',
      detail: errorDetail
    }

    dialog.showMessageBox(dialogOpts).then(() => {
      console.log('[AutoUpdater] Пользователь уведомлен об ошибке')
    })
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
    console.log('[AutoUpdater] Обновление загружено')

    const dialogOpts = {
      type: 'info' as const,
      buttons: ['Перезапустить', 'Позже'],
      title: 'Обновление приложения',
      message: 'Новая версия загружена',
      detail: `Версия ${info.version} готова к установке. Перезапустите приложение для применения обновлений.`
    }

    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) {
        console.log('[AutoUpdater] Перезапуск приложения...')
        
        // Принудительно закрываем все окна
        const { BrowserWindow } = require('electron')
        BrowserWindow.getAllWindows().forEach(window => {
          window.destroy()
        })
        
        // Пробуем установить обновление с принудительными параметрами
        try {
          console.log('[AutoUpdater] Установка обновления...')
          // Принудительная установка без проверки подписи
          autoUpdater.quitAndInstall(true, true)
        } catch (error) {
          console.error('[AutoUpdater] Ошибка при установке обновления:', error)
          
          // Если не удалось установить автоматически, пробуем альтернативный способ
          console.log('[AutoUpdater] Попытка альтернативной установки...')
          
          // Для macOS - открываем новую версию напрямую
          if (process.platform === 'darwin') {
            const newAppPath = `/Applications/electronposapp.app`
            exec(`open "${newAppPath}"`, (error) => {
              if (error) {
                console.error('[AutoUpdater] Ошибка открытия новой версии:', error)
                // Открываем GitHub релизы как последний вариант
                shell.openExternal('https://github.com/KhomenkoRoman/ElectronPosApp/releases')
              } else {
                console.log('[AutoUpdater] Новая версия запущена')
                app.quit()
              }
            })
          } else {
            app.quit()
          }
        }
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
  console.log('[AutoUpdater] Feed URL:', autoUpdater.getFeedURL())
  console.log('[AutoUpdater] Auto Download:', autoUpdater.autoDownload)
  console.log('[AutoUpdater] Auto Install on Quit:', autoUpdater.autoInstallOnAppQuit)
  console.log('[AutoUpdater] Force Dev Update Config:', autoUpdater.forceDevUpdateConfig)
  
  // Проверяем доступность обновлений
  autoUpdater.checkForUpdates().then((result) => {
    console.log('[AutoUpdater] Результат проверки обновлений:', result)
  }).catch((error) => {
    console.error('[AutoUpdater] Ошибка при проверке обновлений:', error)
    console.error('[AutoUpdater] Тип ошибки:', error.constructor.name)
    console.error('[AutoUpdater] Код ошибки:', error.code)
  })
}

/**
 * Получение текущей версии приложения
 */
export function getCurrentVersion(): string {
  return autoUpdater.currentVersion.version
}

/**
 * Ручная проверка обновлений (для тестирования)
 */
export function manualCheckForUpdates(): void {
  console.log('[AutoUpdater] Ручная проверка обновлений...')
  
  // Принудительно включаем проверку в режиме разработки
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('[AutoUpdater] Принудительная проверка в режиме разработки')
    autoUpdater.forceDevUpdateConfig = true
    
    // Убеждаемся, что URL настроен правильно (без имени файла)
    const updateUrl = 'https://github.com/KhomenkoRoman/ElectronPosApp/releases/latest/download/'
    autoUpdater.setFeedURL(updateUrl)
    console.log('[AutoUpdater] URL обновлен для режима разработки:', updateUrl)
  }
  
  // Принудительно отключаем проверку подписи для ручной проверки
  autoUpdater.verifyUpdateCodeSignature = false
  
  checkForUpdates()
}
