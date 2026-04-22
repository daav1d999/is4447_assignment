import { AppContext, Habit, HabitLog } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
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

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  if (!context) return null;
  const { habits, habitLogs, categories } = context;

  const getProgress = (habit: Habit) => {
    const periodStart = habit.targetType === 'weekly' ? getWeekStart() : getMonthStart();
    const logs = habitLogs.filter((l: HabitLog) => l.habitId === habit.id && l.logDate >= periodStart);
    const current = logs.reduce((sum, l) => sum + l.value, 0);
    const remaining = Math.max(0, habit.targetValue - current);
    const exceeded = current >= habit.targetValue;
    return { current, remaining, exceeded };
  };

  const getCategoryName = (categoryId: number): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const selectedHabit = habits.find((h) => h.id === selectedHabitId) ?? habits[0] ?? null;
  const selectedProgress = selectedHabit ? getProgress(selectedHabit) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Habits" subtitle={`${habits.length} tracked`} />

      {selectedHabit && selectedProgress ? (
        <View style={styles.circleSection}>
          <Progress.Circle
            size={250}
            progress={Math.min(selectedProgress.current / selectedHabit.targetValue, 1)}
            showsText={true}
            formatText={() => `${selectedProgress.current}/${selectedHabit.targetValue}`}
            color={selectedProgress.exceeded ? '#22C55E' : '#3B82F6'}
            unfilledColor="#E5E7EB"
            borderWidth={0}
            thickness={10}
            textStyle={styles.circleText}
          />
          <Text variant="titleMedium" style={styles.circleName}>{selectedHabit.name}</Text>
          <Text variant="bodySmall" style={{ color: selectedProgress.exceeded ? '#16A34A' : '#DC2626' }}>
            {selectedProgress.exceeded ? 'Target met!' : `${selectedProgress.remaining} remaining`}
          </Text>
        </View>
      ) : null}

      <Button mode="contained" onPress={() => router.push({ pathname: '../habit/add' })} style={styles.addButton}>
        Add Habit
      </Button>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <Text style={styles.emptyText}>No habits yet.</Text>
        ) : (
          habits.map((habit: Habit) => {
            const { current, remaining, exceeded } = getProgress(habit);
            const isSelected = selectedHabit?.id === habit.id;
            return (
              <Card
                key={habit.id}
                mode="outlined"
                onPress={() => setSelectedHabitId(habit.id)}
                onLongPress={() => router.push({ pathname: '../habit/[id]', params: { id: habit.id.toString() } })}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <Card.Content>
                  <Text variant="titleMedium">{habit.name}</Text>
                 
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  circleSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  circleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  circleName: {
    marginTop: 8,
  },
  addButton: {
    marginBottom: 4,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    marginBottom: 12,
  },
  cardSelected: {
    borderColor: '#0F766E',
    borderWidth: 2,
  },
  meta: {
    color: '#64748B',
    marginTop: 2,
  },
  progressBar: {
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 5,
    height: 8,
  },
});