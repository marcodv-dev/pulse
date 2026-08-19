import { useState, useEffect, useRef } from 'react'
import type { View } from '../../App'
import type { Workout, Exercise } from '../../db/schema'
import { getWorkout, updateExercise } from '../../db/workouts'
import { getLogsByExercise, addLog } from '../../db/logs'
import './WorkoutExecution.css'

interface Props {
  workoutId: string
  dayId: string
  exerciseId: string
  onNavigate: (v: View) => void
}

export default function WorkoutExecution({ workoutId, dayId, exerciseId, onNavigate }: Props) {
  const [workout, setWorkout] = useState<Workout | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [weight, setWeight] = useState(0)
  const [rest, setRest] = useState(120)
  const [loading, setLoading] = useState(true)

  const initialRef = useRef<{ weight: number; rest: number } | null>(null)
  const latestRef = useRef<{ weight: number; rest: number; exerciseId: string | null }>({ weight: 0, rest: 0, exerciseId: null })
  const saveTimerRef = useRef<number | null>(null)

  const load = async () => {
    const w = await getWorkout(workoutId)
    setLoading(false)
    if (!w) return
    setWorkout(w)

    const day = w.days.find(d => d.dayId === dayId)
    if (!day) return

    const idx = day.exercises.findIndex(e => e.exerciseId === exerciseId)
    const ex = day.exercises[idx >= 0 ? idx : 0]
    setCurrentIndex(idx >= 0 ? idx : 0)
    setExercises(day.exercises)
    setWeight(ex.targetWeight)
    setRest(ex.restSeconds)
    initialRef.current = { weight: ex.targetWeight, rest: ex.restSeconds }
  }

  useEffect(() => { load() }, [workoutId, dayId, exerciseId])

  const currentExercise = exercises[currentIndex]

  useEffect(() => {
    latestRef.current = { weight, rest, exerciseId: currentExercise?.exerciseId ?? null }
  }, [weight, rest, currentExercise])

  useEffect(() => {
    if (!currentExercise) return
    const init = initialRef.current
    if (!init) return
    if (weight === init.weight && rest === init.rest) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      updateExercise(workoutId, dayId, currentExercise.exerciseId, { targetWeight: weight, restSeconds: rest })
      saveTimerRef.current = null
    }, 600)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = null
      }
    }
  }, [weight, rest, currentExercise, workoutId, dayId])

  useEffect(() => {
    return () => {
      const t = saveTimerRef.current
      if (t) {
        clearTimeout(t)
        saveTimerRef.current = null
      }
      const l = latestRef.current
      const init = initialRef.current
      if (l.exerciseId && init && (l.weight !== init.weight || l.rest !== init.rest)) {
        updateExercise(workoutId, dayId, l.exerciseId, { targetWeight: l.weight, restSeconds: l.rest })
      }
    }
  }, [workoutId, dayId])

  const handleSetComplete = async () => {
    if (!currentExercise || !workout) return

    const existingLogs = await getLogsByExercise(workoutId, dayId, currentExercise.exerciseId)

    await addLog({
      workoutId,
      dayId,
      exerciseId: currentExercise.exerciseId,
      setNumber: existingLogs.length + 1,
      weightUsed: weight,
      restDurationGiven: rest,
      completed: true
    })

    await updateExercise(workoutId, dayId, currentExercise.exerciseId, {
      targetWeight: weight,
      restSeconds: rest
    })

    onNavigate({ name: 'restTimer', workoutId, dayId, exerciseId: currentExercise.exerciseId, duration: rest })
  }

  const goToExercise = (index: number) => {
    if (index >= 0 && index < exercises.length) {
      const ex = exercises[index]
      onNavigate({ name: 'workoutExecution', workoutId, dayId, exerciseId: ex.exerciseId })
    }
  }

  const day = workout?.days.find(d => d.dayId === dayId)

  if (loading) return (
    <div className="execution">
      <header className="exec-header" />
      <div className="exec-body" />
    </div>
  )
  if (!currentExercise) {
    return (
      <div className="execution">
        <header className="exec-header">
          <button className="btn btn-pill btn-secondary" onClick={() => onNavigate({ name: 'workoutEditor', workoutId })}><img src="/back.png" className="icon" alt="Indietro" /></button>
          <h2 className="exec-title">Allenamento</h2>
          <div style={{ width: 40 }} />
        </header>
        <div className="exec-empty">
          <p>Nessun esercizio in questa giornata.</p>
          <button className="btn btn-primary btn-pill" onClick={() => onNavigate({ name: 'workoutEditor', workoutId })}>
            Torna alla scheda
          </button>
        </div>
      </div>
    )
    
  }

  return (
    <div className="execution">
      <header className="exec-header">
        <button className="btn btn-pill btn-secondary" onClick={() => onNavigate({ name: 'workoutEditor', workoutId })}><img src="/back.png" className="icon" alt="Indietro" /></button>
        <div className="exec-header-info">
          <span className="exec-header-day">{day?.title}</span>
        </div>
        <span className="exec-header-progress">Es. {currentIndex + 1}/{exercises.length}</span>
      </header>

      <div className="exec-body">
        <div style={{display:'flex'}}>
          <div className="exec-exercise-info">
            <h2 className="exec-exercise-name">{currentExercise.name}</h2>
            <p className="exec-description">{currentExercise.description}</p>
          </div>
          {currentExercise.mediaType === 'image' && currentExercise.mediaContent && (
              <div className="exec-media">
                <img src={currentExercise.mediaContent} alt={currentExercise.name} className="exec-img" />
              </div>
            )}

            {currentExercise.mediaType === 'pdf' && currentExercise.mediaContent && (
              <div className="exec-media">
                <iframe src={currentExercise.mediaContent} title={currentExercise.name} className="exec-pdf" />
              </div>
            )}
        </div>

        <div className="exec-params">
          <label className="param-field">
            <span className="param-label">Peso (kg)</span>
            <input
              className="input param-input"
              type="number"
              min={0}
              step={0.5}
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
            />
          </label>
          <label className="param-field">
            <span className="param-label">Recupero (s)</span>
            <input
              className="input param-input"
              type="number"
              min={0}
              step={5}
              value={rest}
              onChange={e => setRest(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      <div className="exec-bottom">
        <button className="btn-primary big-btn btn-pill" onClick={handleSetComplete}>
          <img src="/check.png" className="icon" alt="" /> SERIE COMPLETATA
        </button>

        <div className="exec-nav">
          <button
            className="btn btn-secondary btn-pill"
            disabled={currentIndex === 0}
            onClick={() => goToExercise(currentIndex - 1)}
          >
            ◀ Prec.
          </button>
          <button
            className="btn btn-secondary btn-pill"
            disabled={currentIndex === exercises.length - 1}
            onClick={() => goToExercise(currentIndex + 1)}
          >
            Succ. ▶
          </button>
        </div>
      </div>
    </div>
  )
}
