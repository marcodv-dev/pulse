import { useState } from 'react'
import Dashboard from './components/Dashboard/Dashboard'
import WorkoutEditor from './components/WorkoutEditor/WorkoutEditor'
import ExerciseForm from './components/ExerciseForm/ExerciseForm'
import WorkoutExecution from './components/WorkoutExecution/WorkoutExecution'
import RestTimer from './components/RestTimer/RestTimer'
import Settings from './components/Settings/Settings'

export type View =
  | { name: 'dashboard' }
  | { name: 'workoutEditor'; workoutId: string }
  | { name: 'exerciseForm'; workoutId: string; dayId: string; exerciseId?: string }
  | { name: 'workoutExecution'; workoutId: string; dayId: string; exerciseId: string }
  | { name: 'restTimer'; workoutId: string; dayId: string; exerciseId: string; duration: number }
  | { name: 'settings' }

function App() {
  const [view, setView] = useState<View>({ name: 'dashboard' })
  const [navKey, setNavKey] = useState(0)
  const navigate = (v: View) => {
    setView(v)
    setNavKey(k => k + 1)
  }

  const handleRestTimerDone = () => {
    navigate({ name: 'workoutExecution', workoutId: (view as any).workoutId, dayId: (view as any).dayId, exerciseId: (view as any).exerciseId })
  }

  switch (view.name) {
    case 'dashboard':
      return <Dashboard key={navKey} onNavigate={navigate} />

    case 'workoutEditor':
      return <WorkoutEditor key={navKey} workoutId={view.workoutId} onNavigate={navigate} />

    case 'exerciseForm':
      return (
        <ExerciseForm
          key={navKey}
          workoutId={view.workoutId}
          dayId={view.dayId}
          exerciseId={view.exerciseId}
          onNavigate={navigate}
        />
      )

    case 'workoutExecution':
      return (
        <WorkoutExecution
          key={navKey}
          workoutId={view.workoutId}
          dayId={view.dayId}
          exerciseId={view.exerciseId}
          onNavigate={navigate}
        />
      )

    case 'restTimer':
      return (
        <RestTimer
          key={navKey}
          duration={view.duration}
          onDone={handleRestTimerDone}
        />
      )

    case 'settings':
      return <Settings key={navKey} onNavigate={navigate} />
  }
}

export default App
