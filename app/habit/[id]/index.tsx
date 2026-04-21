import { AppContext, Habit } from '@/app/_layout';
import InfoTag from '@/components/ui/info-tag';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habitLogs as habitLogsTable, habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  if (!context) return null;
  const { habits, setHabits, categories, habitLogs, setHabitLogs } = context;

  const habit = habits.find((h: Habit) => h.id === Number(id));
  if (!habit) return null;

  const category = categories.find((c) => c.id === habit.categoryId);

  const deleteHabit = async () => {
    await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, Number(id)));
    await db.delete(habitsTable).where(eq(habitsTable.id, Number(id)));
    const rows = await db.select().from(habitsTable);
    const logs = await db.select().from(habitLogsTable);
    setHabits(rows);
    setHabitLogs(logs);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title={habit.name} subtitle="Habit details" />
      <View style={styles.tags}>
        <InfoTag label="Category" value={category?.name ?? 'Unknown'} />
        <InfoTag label="Target" value={`${habit.targetValue}× ${habit.targetType}`} />
        <InfoTag label="Type" value={habit.logType} />
      </View>
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
  buttonSpacing: {
    marginTop: 10,
  },
});