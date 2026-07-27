import { getDB } from './db';
import type { Log } from './schema';

function generateId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllLogs(): Promise<Log[]> {
  const db = await getDB();
  return db.getAll('logs');
}

export async function getLogsByExercise(
  workoutId: string,
  dayId: string,
  exerciseId: string
): Promise<Log[]> {
  const db = await getDB();
  const index = db.transaction('logs').store.index('exercise');
  return index.getAll([workoutId, dayId, exerciseId]);
}

export async function getLastLogForExercise(
  workoutId: string,
  dayId: string,
  exerciseId: string
): Promise<Log | undefined> {
  const logs = await getLogsByExercise(workoutId, dayId, exerciseId);
  logs.sort((a, b) => b.timestamp - a.timestamp);
  return logs[0];
}

export async function addLog(
  log: Omit<Log, 'logId' | 'timestamp'>
): Promise<Log> {
  const db = await getDB();
  const newLog: Log = {
    ...log,
    logId: generateId(),
    timestamp: Date.now()
  };
  await db.add('logs', newLog);
  return newLog;
}

export async function deleteLog(logId: string): Promise<void> {
  const db = await getDB();
  await db.delete('logs', logId);
}

export async function exportLogsAsCSV(): Promise<string> {
  const logs = await getAllLogs();
  const header = 'Data,Ora,Esercizio,Serie,Peso (kg),Recupero (s)';
  const rows = logs.map(log => {
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleDateString('it-IT');
    const timeStr = date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr},${timeStr},${log.exerciseId},${log.setNumber},${log.weightUsed},${log.restDurationGiven}`;
  });
  return [header, ...rows].join('\n');
}
