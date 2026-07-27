import { useState, useEffect } from 'react'
import type { View } from '../../App'
import type { Workout } from '../../db/schema'
import { getWorkout, addDay, updateDay, deleteDay, deleteExercise } from '../../db/workouts'
import './WorkoutEditor.css'

interface Props {
  workoutId: string
  onNavigate: (v: View) => void
}

export default function WorkoutEditor({ workoutId, onNavigate }: Props) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [isAddingDay, setIsAddingDay] = useState(false)
  const [newDayTitle, setNewDayTitle] = useState('')
  const [editingDayId, setEditingDayId] = useState<string | null>(null)
  const [editingDayTitle, setEditingDayTitle] = useState('')

  const loadWorkout = async () => {
    const w = await getWorkout(workoutId)
    setWorkout(w ?? null)
  }

  useEffect(() => { loadWorkout() }, [workoutId])

  useEffect(() => {
    if (workout && workout.days.length > 0 && !selectedDayId) {
      setSelectedDayId(workout.days[0].dayId)
    }
  }, [workout])

  const selectedDay = workout?.days.find(d => d.dayId === selectedDayId)

  const handleAddDay = async () => {
    if (!newDayTitle.trim()) return
    const day = await addDay(workoutId, newDayTitle.trim())
    setNewDayTitle('')
    setIsAddingDay(false)
    await loadWorkout()
    setSelectedDayId(day.dayId)
  }

  const handleRenameDay = async () => {
    if (!editingDayId || !editingDayTitle.trim()) return
    await updateDay(workoutId, editingDayId, { title: editingDayTitle.trim() })
    setEditingDayId(null)
    setEditingDayTitle('')
    await loadWorkout()
  }

  const handleDeleteDay = async (dayId: string) => {
    if (!window.confirm('Eliminare questa giornata?')) return
    const idx = workout?.days.findIndex(d => d.dayId === dayId) ?? -1
    await deleteDay(workoutId, dayId)
    const w = await getWorkout(workoutId)
    setWorkout(w ?? null)
    if (w && w.days.length > 0) {
      const target = idx > 0 ? Math.min(idx - 1, w.days.length - 1) : 0
      setSelectedDayId(w.days[target].dayId)
    } else {
      setSelectedDayId(null)
    }
  }

  const handleDeleteExercise = async (dayId: string, exerciseId: string) => {
    if (!window.confirm('Eliminare questo esercizio?')) return
    await deleteExercise(workoutId, dayId, exerciseId)
    await loadWorkout()
  }

  if (!workout) return (
    <div className="editor">
      <header className="editor-header" />
    </div>
  )

  return (
    <div className="editor">
      <header className="editor-header">
        <button className="btn btn-pill btn-secondary" onClick={() => onNavigate({ name: 'dashboard' })}><img src="/back.png" className="icon" alt="Indietro" /></button>
        <h2 className="editor-title">{workout.title}</h2>
        <div style={{ width: 40 }} />
      </header>

      <div className="day-tabs">
        {workout.days.map(d => (
          <button
            key={d.dayId}
            className={`day-tab btn-pill ${d.dayId === selectedDayId ? 'active' : ''}`}
            onClick={() => setSelectedDayId(d.dayId)}
          >
            {d.title}
          </button>
        ))}
        <button className="day-tab add-tab btn btn-secondary btn-pill" onClick={() => setIsAddingDay(true)}>
          <img src="/plus.png" className="icon" alt="Aggiungi giorno" />
        </button>
      </div>

      {isAddingDay && (
        <div className="overlay">
          <div className="modal">
            <h3>Nuova Giornata</h3>
            <input
              className="input"
              placeholder="Nome (es. Upper, A...)"
              value={newDayTitle}
              onChange={e => setNewDayTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddDay()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-primary btn-pill" onClick={handleAddDay}>Aggiungi</button>
              <button className="btn btn-secondary btn-pill" onClick={() => { setIsAddingDay(false); setNewDayTitle('') }}>Annulla</button>
            </div>
          </div>
        </div>
      )}

      {selectedDay && (
        <div className="day-section">
          <div className="day-header">
            <h3 className="day-name">{selectedDay.title}</h3>
            <div className="day-actions">
              <button className="btn btn-sm" onClick={() => { setEditingDayId(selectedDay.dayId); setEditingDayTitle(selectedDay.title) }}><img src="/pencil.png" className="icon" alt="Rinomina" /></button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDay(selectedDay.dayId)}><img src="/trash.png" className="icon" alt="Elimina" style={{width:20,height:20}}/></button>
            </div>
          </div>

          <div className="exercise-list" >
            {selectedDay.exercises.length === 0 && (
              <p className="empty-text">Nessun esercizio. Aggiungine uno!</p>
            )}

            {selectedDay.exercises.map(ex => (
              <div key={ex.exerciseId} className="exercise-card">
                
                <div style={{
                  display:'flex',
                }}>
                  <div className="exercise-info">
                    <h4 className="exercise-name">{ex.name}</h4>
                    <p className="exercise-desc">{ex.description}</p>
                    <div className="exercise-meta">
                      <span><img src="/dumbbell.png" className="icon-sm" alt="" /> {ex.targetWeight}kg</span>
                      <span><img src="/stopwatch.png" className="icon-sm" alt="" /> {ex.restSeconds}s</span>
                    </div>
                  </div>
                  <div className="exercise-actions">
                    <button
                      className="btn btn-pill icon-btn"
                      onClick={() => onNavigate({ name: 'exerciseForm', workoutId, dayId: selectedDay.dayId, exerciseId: ex.exerciseId })}
                    >
                      <img src="/pencil.png" className="icon" alt="Modifica" />
                    </button>
                    <button className="btn btn-pill icon-btn" onClick={() => handleDeleteExercise(selectedDay.dayId, ex.exerciseId)}><img src="/trash.png" className="icon" alt="Elimina" style={{width:20,height:20}}/></button>
                  </div>
                </div>
                
                <button
                  className="play-btn btn btn-primary btn-pill"
                  onClick={() => onNavigate({ name: 'workoutExecution', workoutId, dayId: selectedDay.dayId, exerciseId: ex.exerciseId })}
                >
                  Avvia
                </button>
              </div>
            ))}
          </div>

        </div>
      )}

      {selectedDay && (
        <button
          className="btn btn-primary btn-pill btn-add-exercise-fixed"
          onClick={() => onNavigate({ name: 'exerciseForm', workoutId, dayId: selectedDay.dayId })}
        >
          <img src="/plus.png" className="icon" alt="Aggiungi esercizio" /> Aggiungi Esercizio
        </button>
      )}

      {editingDayId && (
        <div className="overlay">
          <div className="modal">
            <h3>Rinomina giornata</h3>
            <input
              className="input"
              value={editingDayTitle}
              onChange={e => setEditingDayTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleRenameDay()}
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary btn-pill" onClick={() => setEditingDayId(null)}>Annulla</button>
              <button className="btn btn-primary btn-pill" onClick={handleRenameDay}>Salva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
