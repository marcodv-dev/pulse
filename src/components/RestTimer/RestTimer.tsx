import { useState, useEffect, useRef } from 'react'
import { playEndSequence } from '../../utils/audio'
import { vibrate } from '../../utils/vibration'
import { requestWakeLock, releaseWakeLock } from '../../utils/wakeLock'
import './RestTimer.css'

interface Props {
  duration: number
  onDone: () => void
}

const ALERT_THRESHOLD = 10

export default function RestTimer({ duration, onDone }: Props) {
  const [remaining, setRemaining] = useState(duration)
  const finishedRef = useRef(false)

  useEffect(() => {
    requestWakeLock()

    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1
        if (next <= 0) {
          clearInterval(interval)
          if (!finishedRef.current) {
            finishedRef.current = true
            playEndSequence()
            vibrate()
            setTimeout(onDone, 500)
          }
          return 0
        }
        return next
      })
    }, 1000)

    return () => {
      clearInterval(interval)
      releaseWakeLock()
    }
  }, [duration, onDone])

  const handleDismiss = () => {
    if (!finishedRef.current) {
      finishedRef.current = true
      releaseWakeLock()
      onDone()
    }
  }

  const isAlert = remaining <= ALERT_THRESHOLD
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const showBar = remaining > 0

  return (
    <div
      className={`rest-timer ${isAlert ? 'alert' : ''}`}
      onClick={handleDismiss}
    >
      <div className="timer-content">
        <span className="timer-label" style={{fontWeight:`${isAlert?900:600}`}}>RECUPERO</span>
        <span className="timer-display">{display}</span>
        {showBar && <div className="timer-bar">
          <div className="timer-bar-fill" style={{ animationDuration: `${duration}s` }} />
        </div>}
        {remaining > 0 && <span className="timer-hint"> Clicca per chuidere</span>}
      </div>
    </div>
  )
}
