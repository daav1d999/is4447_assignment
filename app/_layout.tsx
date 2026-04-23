import { db } from '@/db/client';
import { categories as categoriesTable, habitLogs as habitLogsTable, habits as habitsTable } from '@/db/schema';
import { seedHabitTrackerIfEmpty } from '@/db/seed';
import { Stack, useRouter, useSegments } from 'expo-router';
import { createContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MD3LightTheme, PaperProvider, Text } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0F766E',
    primaryContainer: '#CCFBF1',
    secondary: '#3B82F6',
    error: '#DC2626',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    onPrimary: '#FFFFFF',
    onSurface: '#0F172A',
    outline: '#E2E8F0',
  },
};

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

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
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  habitLogs: HabitLog[];
  setHabitLogs: React.Dispatch<React.SetStateAction<HabitLog[]>>;
};

export const AppContext = createContext<AppContextType | null>(null);

function useProtectedRoute(currentUser: User | null, ready: boolean) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === ('(auth)' as any);
    if (!currentUser && !inAuthGroup) {
      setTimeout(() => router.replace('/(auth)/login' as any), 0);
    } else if (currentUser && inAuthGroup) {
      setTimeout(() => router.replace('/(tabs)' as any), 0);
    }
  }, [currentUser, segments, ready]);
}

export default function RootLayout() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      await seedHabitTrackerIfEmpty();
      setReady(true);
    };
    void init();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setHabits([]);
      setCategories([]);
      setHabitLogs([]);
      return;
    }

    const loadData = async () => {
      const h = await db.select().from(habitsTable);
      const c = await db.select().from(categoriesTable);
      const l = await db.select().from(habitLogsTable);

      const userHabits = h.filter((r) => r.userId === currentUser.id);
      const userHabitIds = new Set(userHabits.map((habit) => habit.id));

      setHabits(userHabits);
      setCategories(c.filter((r) => r.userId === currentUser.id));
      setHabitLogs(l.filter((log) => userHabitIds.has(log.habitId)));
    };

    void loadData();
  }, [currentUser]);

  useProtectedRoute(currentUser, ready);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <Text variant="headlineMedium" style={styles.loadingTitle}>HabitAware</Text>
        <ActivityIndicator size="large" color="#0F766E" style={styles.spinner} />
        <Text variant="bodyMedium" style={styles.loadingText}>Loading your habits...</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        habits,
        setHabits,
        categories,
        setCategories,
        habitLogs,
        setHabitLogs,
      }}
    >
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
        </Stack>
      </PaperProvider>
    </AppContext.Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingTitle: {
    color: '#0F766E',
    fontWeight: '700',
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 12,
  },
  loadingText: {
    color: '#64748B',
  },
});