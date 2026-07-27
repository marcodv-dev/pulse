import { useState, useEffect } from 'react'
import type { View } from '../../App'
import type { Workout } from '../../db/schema'
import { getAllWorkouts, createWorkout, updateWorkout, deleteWorkout } from '../../db/workouts'
import './Dashboard.css'

interface Props {
  onNavigate: (v: View) => void
}

export default function Dashboard({ onNavigate }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const loadWorkouts = async () => {
    const list = await getAllWorkouts()
    setWorkouts(list)
  }

  useEffect(() => { loadWorkouts() }, [])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    await createWorkout(newTitle.trim())
    setNewTitle('')
    setIsCreating(false)
    await loadWorkouts()
  }

  const handleRename = async (id: string) => {
    if (!editingTitle.trim()) return
    await updateWorkout(id, { title: editingTitle.trim() })
    setEditingId(null)
    setEditingTitle('')
    await loadWorkouts()
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Eliminare questa scheda?')) return
    await deleteWorkout(id)
    await loadWorkouts()
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Pulse</h1>
        <button className="btn btn-pill btn-secondary" onClick={() => onNavigate({ name: 'settings' })}>
          <img src="/settings.png" className="icon" alt="Impostazioni" />
        </button>
      </header>

      <div className="dashboard-content">
        <button className="btn btn-primary btn-pill  btn-add" onClick={() => setIsCreating(true)}>
          <img src="/plus.png" className="icon" alt="Nuova Scheda" /> Nuova Scheda
        </button>
        {/* <button className="btn btn-pill btn-glass btn-add" onClick={() => setIsCreating(true)}>
          + Nuova Scheda
        </button>
        <button className="btn btn-pill btn-glass btn-add" onClick={() => setIsCreating(true)}>
          + Nuova Scheda
        </button> */}

        {isCreating && (
          <div className="overlay">
            <div className="modal">
              <h3>Nuova Scheda</h3>
              <input
                className="input"
                placeholder="Nome scheda..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn btn-primary btn-pill" onClick={handleCreate}>Crea</button>
                <button className="btn btn-secondary btn-pill" onClick={() => { setIsCreating(false); setNewTitle('') }}>Annulla</button>
              </div>
            </div>
          </div>
        )}

        <div className="workout-list">
          {workouts.map(w => (
            <div key={w.id} className={`workout-card${activeCardId === w.id ? ' active' : ''}`}>
              <div className="workout-card-body" onClick={() => onNavigate({ name: 'workoutEditor', workoutId: w.id })} onMouseDown={() => setActiveCardId(w.id)} onMouseUp={() => setActiveCardId(null)} onMouseLeave={() => setActiveCardId(null)}>
                <h3 className="workout-title">{w.title}</h3>
                <p className="workout-days">
                  {w.days.map(d => d.title).join(' · ')}
                </p>
                {w.isActive && <span className="badge">Attiva</span>}
              </div>
              <div className="workout-card-actions">
                <button className="btn btn-pill icon-btn" onClick={e => { e.stopPropagation(); setEditingId(w.id); setEditingTitle(w.title) }} onMouseDown={e => e.stopPropagation()}><img src="/pencil.png" className="icon" alt="Modifica"/></button>
                <button className="btn btn-pill icon-btn" onClick={e => { e.stopPropagation(); handleDelete(w.id) }} onMouseDown={e => e.stopPropagation()}><img src="/trash.png" className="icon" alt="Elimina"style={{width:'20px',height:'20px'}} /></button>
              </div>
            </div>
          ))}
        </div>

        {editingId && (
          <div className="overlay">
            <div className="modal">
              <h3>Rinomina scheda</h3>
              <input
                className="input"
                value={editingTitle}
                onChange={e => setEditingTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRename(editingId)}
                autoFocus
              />
              <div className="modal-actions">
                <button className="btn btn-secondary btn-pill" onClick={() => setEditingId(null)}>Annulla</button>
                <button className="btn btn-primary btn-pill" onClick={() => handleRename(editingId)}>Salva</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
