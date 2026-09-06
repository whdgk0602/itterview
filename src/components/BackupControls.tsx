import { useRef, useState, type ChangeEvent } from 'react'
import type { AppState } from '../../types'
import { serializeState } from '../lib/storage'

interface BackupControlsProps {
  state?: AppState | null
  onImport: (raw: string) => boolean
  variant?: 'menu' | 'inline'
}

export function BackupControls({ state, onImport, variant = 'menu' }: BackupControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  function handleExport() {
    if (!state) return
    const blob = new Blob([serializeState(state)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-coaching-backup-${state.lastCheckIn || 'new'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const success = onImport(String(reader.result))
      setImportError(success ? null : '백업 파일을 읽을 수 없어요. 올바른 백업 파일인지 확인해주세요.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const actions = (
    <>
      <div className="flex gap-3">
        {state && (
          <button onClick={handleExport} className="text-sm text-slate-600 underline hover:text-indigo-600">
            백업 저장
          </button>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-sm text-slate-600 underline hover:text-indigo-600"
        >
          백업 불러오기
        </button>
      </div>
      {importError && <p className="mt-1 text-xs text-red-500">{importError}</p>}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  )

  if (variant === 'inline') {
    return <div className="flex flex-col gap-1 px-4 py-2 text-xs text-slate-500">{actions}</div>
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="설정"
        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
      >
        ⚙️
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          {actions}
        </div>
      )}
    </div>
  )
}
