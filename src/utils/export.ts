import { getDB } from '../db/db';
import { getAllWorkouts } from '../db/workouts';
import { getAllLogs, exportLogsAsCSV } from '../db/logs';

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportJSON(): Promise<void> {
  const workouts = await getAllWorkouts();
  const logs = await getAllLogs();

  const data = { workouts, logs };
  const json = JSON.stringify(data, null, 2);
  const date = new Date().toISOString().split('T')[0];
  downloadFile(json, `gym-tracker-backup-${date}.json`, 'application/json');
}

export async function exportCSV(): Promise<void> {
  const csv = await exportLogsAsCSV();
  const date = new Date().toISOString().split('T')[0];
  downloadFile(csv, `gym-tracker-storico-${date}.csv`, 'text/csv');
}

export async function importJSON(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (!data.workouts || !data.logs) {
    throw new Error('File JSON non valido');
  }

  const db = await getDB();

  const tx = db.transaction(['workouts', 'logs'], 'readwrite');
  for (const workout of data.workouts) {
    await tx.objectStore('workouts').put(workout);
  }
  for (const log of data.logs) {
    await tx.objectStore('logs').put(log);
  }
  await tx.done;
}
