import { useState, useEffect } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions)
  const [appVersion, setAppVersion] = useState<string>('')

  useEffect(() => {
    // Получаем версию приложения
    window.api.getAppVersion().then((version: string) => {
      setAppVersion(version)
    }).catch((error: Error) => {
      console.error('Ошибка получения версии приложения:', error)
      setAppVersion('Неизвестно')
    })
  }, [])

  return (
    <ul className="versions">
      <li className="app-version">Приложение v{appVersion}</li>
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
