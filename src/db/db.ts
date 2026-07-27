import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'gym-tracker';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase | null = null;

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('workouts')) {
        const store = db.createObjectStore('workouts', { keyPath: 'id' });
        store.createIndex('isActive', 'isActive');
      }
      if (!db.objectStoreNames.contains('logs')) {
        const store = db.createObjectStore('logs', { keyPath: 'logId' });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('exercise', ['workoutId', 'dayId', 'exerciseId']);
      }
    }
  });

  return dbInstance;
}
