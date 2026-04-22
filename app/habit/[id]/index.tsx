import { AppContext, Habit, HabitLog } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habitLogs as habitLogsTable, habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card, ProgressBar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

function getMonthStart(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  const [logValue, setLogValue] = useState('1');
  const [logNotes, setLogNotes] = useState('');

  if (!context) return null;
  const { habits, setHabits, categories, habitLogs, setHabitLogs } = context;

  const habit = habits.find((h: Habit) => h.id === Number(id));
  if (!habit) return null;

  const category = categories.find((c) => c.id === habit.categoryId);
  const logs = habitLogs.filter((l: HabitLog) => l.habitId === habit.id);

  const periodStart = habit.targetType === 'weekly' ? getWeekStart() : getMonthStart();
  const logsInPeriod = logs.filter((l) => l.logDate >= periodStart);
  const currentProgress = logsInPeriod.reduce((sum, l) => sum + l.value, 0);
  const remaining = Math.max(0, habit.targetValue - currentProgress);
  const exceeded = currentProgress >= habit.targetValue;

  const logHabit = async () => {
    const today = new Date().toISOString().split('T')[0];
    await db.insert(habitLogsTable).values({
      habitId: habit.id,
      logDate: today,
      value: Number(logValue) || 1,
      notes: logNotes.trim() || null,
      createdAt: new Date().toISOString(),
    });
    const logRows = await db.select().from(habitLogsTable);
    setHabitLogs(logRows);
    setLogValue('1');
    setLogNotes('');
  };

  const deleteHabit = async () => {
    await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, Number(id)));
    await db.delete(habitsTable).where(eq(habitsTable.id, Number(id)));
    const rows = await db.select().from(habitsTable);
    const logRows = await db.select().from(habitLogsTable);
    setHabits(rows);
    setHabitLogs(logRows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ScreenHeader title={habit.name} subtitle="Habit details" />

        <Card mode="outlined" style={styles.infoCard}>
          <Card.Content>
            <Text variant="bodyMedium">Category: {category?.name ?? 'Unknown'}</Text>
            <Text variant="bodyMedium">Type: {habit.logType}</Text>
            <Text variant="bodyMedium">Total logs: {logs.length}</Text>
          </Card.Content>
        </Card>

        <Card mode="outlined" style={styles.targetCard}>
          <Card.Content>
            <Text variant="titleMedium">
              {habit.targetType === 'weekly' ? 'Weekly' : 'Monthly'} Target
            </Text>
            <Text variant="headlineSmall">{currentProgress} / {habit.targetValue}</Text>
            <ProgressBar
              progress={Math.min(currentProgress / habit.targetValue, 1)}
              color={exceeded ? '#22C55E' : '#3B82F6'}
              style={styles.progressBar}
            />
            <Text variant="bodyMedium" style={{ color: exceeded ? '#16A34A' : '#DC2626' }}>
              {exceeded ? 'Target met!' : `${remaining} remaining`}
            </Text>
          </Card.Content>
        </Card>

        {habit.logType === 'count' ? (
          <TextInput label="Count" value={logValue} onChangeText={setLogValue} mode="outlined" keyboardType="numeric" style={styles.input} />
        ) : null}
        <TextInput label="Notes" value={logNotes} onChangeText={setLogNotes} placeholder="Optional" mode="outlined" style={styles.input} />
        <Button mode="contained" onPress={logHabit}>Log Today</Button>

        <Button mode="outlined" onPress={() => router.push({ pathname: '../habit/[id]/edit', params: { id } })} style={styles.spacing}>Edit</Button>
        <Button mode="outlined" textColor="#DC2626" onPress={deleteHabit} style={styles.spacing}>Delete</Button>
        <Button mode="text" onPress={() => router.back()} style={styles.spacing}>Back</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, padding: 20 },
  infoCard: { marginBottom: 12 },
  targetCard: { marginBottom: 12 },
  progressBar: { marginVertical: 8, borderRadius: 5, height: 8 },
  input: { marginBottom: 12 },
  spacing: { marginTop: 10 },
});