import { AppContext, Habit, HabitLog } from '@/app/_layout';
import { db } from '@/db/client';
import { habitLogs as habitLogsTable } from '@/db/schema';
import { useContext, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text, TextInput } from 'react-native-paper';
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

export default function ProgressScreen() {
  const context = useContext(AppContext);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [logValue, setLogValue] = useState('1');
  const [logNotes, setLogNotes] = useState('');

  if (!context) return null;
  const { habits, categories, habitLogs, setHabitLogs } = context;

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getProgress = (habit: Habit) => {
    const periodStart =
      habit.targetType === 'weekly' ? getWeekStart() : getMonthStart();

    const logs = habitLogs.filter(
      (log: HabitLog) => log.habitId === habit.id && log.logDate >= periodStart
    );

    const current = logs.reduce((sum, log) => sum + log.value, 0);
    const remaining = Math.max(0, habit.targetValue - current);
    const exceeded = current >= habit.targetValue;

    return { current, remaining, exceeded };
  };

  const selectedHabit =
    habits.find((habit) => habit.id === selectedHabitId) ?? habits[0] ?? null;

  const selectedProgress = selectedHabit ? getProgress(selectedHabit) : null;

  const logHabit = async () => {
    if (!selectedHabit) return;

    const today = new Date().toISOString().split('T')[0];

    await db.insert(habitLogsTable).values({
      habitId: selectedHabit.id,
      logDate: today,
      value: selectedHabit.logType === 'count' ? Number(logValue) || 1 : 1,
      notes: logNotes.trim() || null,
      createdAt: new Date().toISOString(),
    });

    const rows = await db.select().from(habitLogsTable);
    setHabitLogs(rows);

    setLogValue('1');
    setLogNotes('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          

          {selectedHabit && selectedProgress ? (
            <View style={styles.circleSection}>
              <Progress.Circle
                size={220}
                progress={Math.min(
                  selectedProgress.current / selectedHabit.targetValue,
                  1
                )}
                showsText
                formatText={() =>
                  `${selectedProgress.current}/${selectedHabit.targetValue}`
                }
                color={selectedProgress.exceeded ? '#22C55E' : '#3B82F6'}
                unfilledColor="#E5E7EB"
                borderWidth={0}
                thickness={10}
                textStyle={styles.circleText}
              />
              <Text variant="titleMedium" style={styles.circleName}>
                {selectedHabit.name}
              </Text>
              <Text style={styles.meta}>
                {getCategoryName(selectedHabit.categoryId)} • {selectedHabit.targetType} target
              </Text>
              <Text
                variant="bodySmall"
                style={[
                  styles.statusText,
                  { color: selectedProgress.exceeded ? '#16A34A' : '#DC2626' },
                ]}
              >
                {selectedProgress.exceeded
                  ? 'Target met!'
                  : `${selectedProgress.remaining} remaining`}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No habits yet.</Text>
          )}

          <Text variant="titleSmall" style={styles.sectionLabel}>
            Select Habit
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
            keyboardShouldPersistTaps="handled"
          >
            {habits.map((habit: Habit) => (
              <Chip
                key={habit.id}
                selected={selectedHabit?.id === habit.id}
                onPress={() => setSelectedHabitId(habit.id)}
                style={styles.chip}
              >
                {habit.name}
              </Chip>
            ))}
          </ScrollView>

          {selectedHabit ? (
            <Card mode="outlined" style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Log {selectedHabit.name}
                </Text>

                {selectedHabit.logType === 'count' ? (
                  <TextInput
                    label="Count"
                    value={logValue}
                    onChangeText={setLogValue}
                    keyboardType="numeric"
                    mode="outlined"
                    style={styles.input}
                    returnKeyType="done"
                  />
                ) : null}

                <TextInput
                  label="Notes"
                  value={logNotes}
                  onChangeText={setLogNotes}
                  placeholder="Optional"
                  mode="outlined"
                  multiline
                  style={styles.input}
                />

                <Button mode="contained" onPress={logHabit}>
                  Log Today
                </Button>
              </Card.Content>
            </Card>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 24,
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
  meta: {
    color: '#64748B',
    marginTop: 4,
  },
  statusText: {
    marginTop: 6,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  chipRow: {
    paddingBottom: 8,
    paddingRight: 8,
  },
  chip: {
    marginRight: 8,
  },
  card: {
    marginTop: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 20,
  },
});