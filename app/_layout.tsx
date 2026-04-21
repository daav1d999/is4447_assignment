import { db } from '@/db/client';
import { categories as categoriesTable, habitLogs as habitLogsTable, habits as habitsTable } from '@/db/schema';
import { seedHabitTrackerIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import { createContext, useEffect, useState } from 'react';

export type Habit = {
  id: number;
  userId: number;
  categoryId: number;
  name: string;
  description: string | null;
  targetType: string;
  targetValue: number;
  logType: string;
  archived: number;
  createdAt: string;
};

export type Category = {
  id: number;
  userId: number;
  name: string;
  color: string | null;
  createdAt: string;
};

export type HabitLog = {
  id: number;
  habitId: number;
  logDate: string;
  value: number;
  notes: string | null;
  createdAt: string;
};

type AppContextType = {
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  habitLogs: HabitLog[];
  setHabitLogs: React.Dispatch<React.SetStateAction<HabitLog[]>>;
};

export const AppContext = createContext<AppContextType | null>(null);

export default function RootLayout() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    const loadData = async () => {
      await seedHabitTrackerIfEmpty();
      const h = await db.select().from(habitsTable);
      const c = await db.select().from(categoriesTable);
      const l = await db.select().from(habitLogsTable);
      setHabits(h);
      setCategories(c);
      setHabitLogs(l);
    };
    void loadData();
  }, []);

  return (
    <AppContext.Provider value={{ habits, setHabits, categories, setCategories, habitLogs, setHabitLogs }}>
      <Stack />
    </AppContext.Provider>
  );
}