import { AppContext, Habit, HabitLog } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habitLogs as habitLogsTable, habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';
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
      <ScreenHeader title={habit.name} subtitle="Habit details" />
      <View style={styles.tags}>
        <InfoTag label="Category" value={category?.name ?? 'Unknown'} />
        <InfoTag label="Type" value={habit.logType} />
        <InfoTag label="Logs" value={String(logs.length)} />
      </View>

      <Text style={styles.targetLabel}>
        {habit.targetType === 'weekly' ? 'Weekly' : 'Monthly'} Target: {currentProgress} / {habit.targetValue}
      </Text>
      <Progress.Bar
        progress={Math.min(currentProgress / habit.targetValue, 1)}
        width={null}
        height={12}
        borderRadius={6}
        color={exceeded ? '#22C55E' : '#3B82F6'}
        unfilledColor="#E5E7EB"
        borderWidth={0}
        style={styles.progressBar}
      />
      <Text style={[styles.targetStatus, { color: exceeded ? '#16A34A' : '#DC2626' }]}>
        {exceeded ? 'Target met!' : `${remaining} remaining`}
      </Text>

      <PrimaryButton
        label="Edit"
        onPress={() =>
          router.push({
            pathname: '../habit/[id]/edit',
            params: { id },
          })
        }
      />
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Delete" variant="danger" onPress={deleteHabit} />
      </View>
      <View style={styles.buttonSpacing}>
        <PrimaryButton label="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    padding: 20,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  targetLabel: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBar: {
    marginBottom: 6,
  },
  targetStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 18,
  },
  buttonSpacing: {
    marginTop: 10,
  },
});