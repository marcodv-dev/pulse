import { useState, useEffect, useRef } from 'react'
import type { View } from '../../App'
import { getWorkout, addExercise, updateExercise } from '../../db/workouts'
import './ExerciseForm.css'

interface Props {
  workoutId: string
  dayId: string
  exerciseId?: string
  onNavigate: (v: View) => void
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ExerciseForm({ workoutId, dayId, exerciseId, onNavigate }: Props) {
  const isEditing = !!exerciseId
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(isEditing)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [mediaType, setMediaType] = useState<'text' | 'image' | 'pdf'>('text')
  const [mediaContent, setMediaContent] = useState<string | null>(null)
  const [targetWeight, setTargetWeight] = useState(0)
  const [restSeconds, setRestSeconds] = useState(120)

  useEffect(() => {
    if (!exerciseId) { setLoading(false); return }
    const load = async () => {
      const w = await getWorkout(workoutId)
      if (!w) { setLoading(false); return }
      const day = w.days.find(d => d.dayId === dayId)
      if (!day) { setLoading(false); return }
      const ex = day.exercises.find(e => e.exerciseId === exerciseId)
      if (!ex) { setLoading(false); return }
      setName(ex.name)
      setDescription(ex.description)
      setMediaType(ex.mediaType)
      setMediaContent(ex.mediaContent)
      setTargetWeight(ex.targetWeight)
      setRestSeconds(ex.restSeconds)
      setLoading(false)
    }
    load()
  }, [exerciseId, workoutId, dayId])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      setMediaType('image')
    } else if (file.type === 'application/pdf') {
      setMediaType('pdf')
    }

    fileToBase64(file).then(setMediaContent)
  }

  const handleSave = async () => {
    const data = {
      name: name.trim() || 'Esercizio',
      description: description.trim(),
      mediaType,
      mediaContent,
      targetWeight,
      restSeconds
    }

    if (isEditing) {
      await updateExercise(workoutId, dayId, exerciseId!, data)
    } else {
      await addExercise(workoutId, dayId, data)
    }

    onNavigate({ name: 'workoutEditor', workoutId })
  }

  if (loading) return (
    <div className="form-page">
      <header className="form-header" />
      <div className="form-body" />
    </div>
  )
  return (
    <div className="form-page">
      <header className="form-header">
        <button className="btn btn-pill btn-secondary" onClick={() => onNavigate({ name: 'workoutEditor', workoutId })}><img src="/back.png" className="icon" alt="Indietro" /></button>
        <h2 className="form-title">{isEditing ? 'Modifica Esercizio' : 'Nuovo Esercizio'}</h2>
        <div style={{ width: 40 }} />
      </header>

      <div className="form-body">
        <label className="field">
          <span className="field-label">Nome</span>
          <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Es. Panca Piana" />
        </label>

        <label className="field">
          <span className="field-label">Descrizione</span>
          <textarea
            className="input textarea"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Es. 4x8 r120s - Fermo al petto 1 sec"
            rows={3}
          />
        </label>

        <div className="field">
          <span className="field-label">Media</span>
          <div className="media-options">
            <label className={`media-option ${mediaType === 'text' ? 'active' : ''}`}>
              <input type="radio" name="media" checked={mediaType === 'text'} onChange={() => setMediaType('text')} />
              Testo
            </label>
            <label className={`media-option ${mediaType === 'image' ? 'active' : ''}`}>
              <input type="radio" name="media" checked={mediaType === 'image'} onChange={() => setMediaType('image')} />
              Immagine
            </label>
            <label className={`media-option ${mediaType === 'pdf' ? 'active' : ''}`}>
              <input type="radio" name="media" checked={mediaType === 'pdf'} onChange={() => setMediaType('pdf')} />
              PDF
            </label>
          </div>
        </div>

        {mediaType !== 'text' && (
          <div className="field">
            <button className="btn btn-secondary btn-pill" onClick={() => fileInputRef.current?.click()}>
              Scegli File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={mediaType === 'image' ? 'image/*' : '.pdf'}
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            {mediaContent && (
              <div className="media-preview">
                {mediaType === 'image' ? (
                  <img src={mediaContent} alt="anteprima" className="preview-img" />
                ) : (
                  <p>PDF caricato</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="field-row">
          <label className="field">
            <span className="field-label">Peso Target (kg)</span>
            <input className="input" type="number" min={0} step={0.5} value={targetWeight} onChange={e => setTargetWeight(Number(e.target.value))} />
          </label>
          <label className="field">
            <span className="field-label">Recupero (s)</span>
            <input className="input" type="number" min={0} step={5} value={restSeconds} onChange={e => setRestSeconds(Number(e.target.value))} />
          </label>
        </div>

        <button className="btn btn-primary btn-pill btn-save" onClick={handleSave}>
          Salva
        </button>
      </div>
    </div>
  )
}
