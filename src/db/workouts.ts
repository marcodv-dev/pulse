import { getDB } from './db';
import type { Workout, Day, Exercise } from './schema';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function getAllWorkouts(): Promise<Workout[]> {
  const db = await getDB();
  return db.getAll('workouts');
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  const db = await getDB();
  return db.get('workouts', id);
}

export async function createWorkout(title: string): Promise<Workout> {
  const db = await getDB();
  const workout: Workout = {
    id: generateId(),
    title,
    isActive: false,
    createdAt: Date.now(),
    days: []
  };
  await db.add('workouts', workout);
  return workout;
}

export async function updateWorkout(
  id: string,
  data: Partial<Pick<Workout, 'title' | 'isActive'>>
): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', id);
  if (!workout) throw new Error('Workout not found');
  await db.put('workouts', { ...workout, ...data });
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('workouts', id);
}

export async function addDay(workoutId: string, title: string): Promise<Day> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const day: Day = {
    dayId: generateId(),
    title,
    exercises: []
  };
  workout.days.push(day);
  await db.put('workouts', workout);
  return day;
}

export async function updateDay(
  workoutId: string,
  dayId: string,
  data: Partial<Pick<Day, 'title'>>
): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const day = workout.days.find((d: Day) => d.dayId === dayId);
  if (!day) throw new Error('Day not found');

  Object.assign(day, data);
  await db.put('workouts', workout);
}

export async function deleteDay(workoutId: string, dayId: string): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  workout.days = workout.days.filter((d: Day) => d.dayId !== dayId);
  await db.put('workouts', workout);
}

export async function reorderDays(
  workoutId: string,
  fromIndex: number,
  toIndex: number
): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const [day] = workout.days.splice(fromIndex, 1);
  workout.days.splice(toIndex, 0, day);
  await db.put('workouts', workout);
}

export async function addExercise(
  workoutId: string,
  dayId: string,
  exercise: Omit<Exercise, 'exerciseId'>
): Promise<Exercise> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const day = workout.days.find((d: Day) => d.dayId === dayId);
  if (!day) throw new Error('Day not found');

  const newExercise: Exercise = {
    ...exercise,
    exerciseId: generateId()
  };
  day.exercises.push(newExercise);
  await db.put('workouts', workout);
  return newExercise;
}

export async function updateExercise(
  workoutId: string,
  dayId: string,
  exerciseId: string,
  data: Partial<Omit<Exercise, 'exerciseId'>>
): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const day = workout.days.find((d: Day) => d.dayId === dayId);
  if (!day) throw new Error('Day not found');

  const exercise = day.exercises.find((e: Exercise) => e.exerciseId === exerciseId);
  if (!exercise) throw new Error('Exercise not found');

  Object.assign(exercise, data);
  await db.put('workouts', workout);
}

export async function deleteExercise(
  workoutId: string,
  dayId: string,
  exerciseId: string
): Promise<void> {
  const db = await getDB();
  const workout = await db.get('workouts', workoutId);
  if (!workout) throw new Error('Workout not found');

  const day = workout.days.find((d: Day) => d.dayId === dayId);
  if (!day) throw new Error('Day not found');

  day.exercises = day.exercises.filter((e: Exercise) => e.exerciseId !== exerciseId);
  await db.put('workouts', workout);
}
