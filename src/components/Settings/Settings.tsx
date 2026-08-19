import { useState, useRef } from 'react'
import type { View } from '../../App'
import { exportJSON, exportCSV, importJSON } from '../../utils/export'
import { getTheme, setTheme, type Theme } from '../../utils/theme'
import './Settings.css'

interface Props {
  onNavigate: (v: View) => void
}

export default function Settings({ onNavigate }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const [theme, setThemeState] = useState<Theme>(() => getTheme())

  const handleThemeChange = (t: Theme) => {
    setTheme(t)
    setThemeState(t)
  }

  const handleExportJSON = async () => {
    try {
      await exportJSON()
    } catch (err) {
      console.error(err)
    }
  }

  const handleExportCSV = async () => {
    try {
      await exportCSV()
    } catch (err) {
      console.error(err)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      await importJSON(file)
      setImportStatus('success')
      setImportMessage('Backup importato con successo!')
    } catch {
      setImportStatus('error')
      setImportMessage('Errore: file non valido.')
    }
  }

  return (
    <div className="settings">
      <header className="settings-header">
        <button className="btn btn-pill btn-secondary" onClick={() => onNavigate({ name: 'dashboard' })}><img src="/back.png" className="icon" alt="Indietro" /></button>
        <h2 className="settings-title">Impostazioni</h2>
        <div style={{ width: 40 }} />
      </header>

      <div className="settings-body">
        <section className="settings-section">
          <h3>Aspetto</h3>
          <div className="theme-toggle">
            <button
              className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              Scuro
            </button>
            <button
              className={`theme-option ${theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              Chiaro
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h3>Backup e Ripristino</h3>

          <div className="settings-actions">
            <button className="btn btn-secondary btn-pill" onClick={handleExportJSON}>
              Esporta JSON
            </button>
            <button className="btn btn-secondary btn-pill" onClick={handleExportCSV}>
              Esporta CSV
            </button>
            <button className="btn btn-secondary btn-pill" onClick={() => fileInputRef.current?.click()}>
              Importa JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>

          {importStatus !== 'idle' && (
            <p className={`import-status ${importStatus}`}>
              {importMessage}
            </p>
          )}
        </section>

        <section className="settings-section">
          <h3>Info App</h3>
          <div className="info-list">
            <div className="info-row">
              <span>Versione</span>
              <span>1.0.0</span>
            </div>
            <div className="info-row">
              <span>Dati salvati</span>
              <span>100% offline</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
