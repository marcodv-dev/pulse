export interface Exercise {
  exerciseId: string;
  name: string;
  description: string;
  mediaType: 'text' | 'image' | 'pdf';
  mediaContent: string | null;
  targetWeight: number;
  restSeconds: number;
}

export interface Day {
  dayId: string;
  title: string;
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: number;
  days: Day[];
}

export interface Log {
  logId: string;
  timestamp: number;
  workoutId: string;
  dayId: string;
  exerciseId: string;
  setNumber: number;
  weightUsed: number;
  restDurationGiven: number;
  completed: boolean;
}
