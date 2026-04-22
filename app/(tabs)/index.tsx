//code adapted from Tutorial-25-March

import { AppContext, Habit, HabitLog } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button, Card, Chip, Searchbar, Text,
} from 'react-native-paper';
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

function getHabitYear(createdAt: string | number | Date): string {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return String(date.getFullYear());
}

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');

  if (!context) return null;

  const { habits, habitLogs, categories } = context;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const getCategoryName = (categoryId: number): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const yearOptions = [
    'All',
    ...Array.from(
      new Set(habits.map((habit: Habit) => getHabitYear(habit.createdAt)))
    )
      .filter((year) => year !== 'Unknown')
      .sort((a, b) => Number(a) - Number(b)),
  ];

  const filteredHabits = habits.filter((habit: Habit) => {
    const categoryName = getCategoryName(habit.categoryId).toLowerCase();

    const matchesSearch =
      normalizedQuery.length === 0 ||
      habit.name.toLowerCase().includes(normalizedQuery) ||
      categoryName.includes(normalizedQuery);

    const matchesYear =
      selectedYear === 'All' || getHabitYear(habit.createdAt) === selectedYear;

    return matchesSearch && matchesYear;
  });

  const getProgress = (habit: Habit) => {
    const periodStart =
      habit.targetType === 'weekly' ? getWeekStart() : getMonthStart();

    const logs = habitLogs.filter(
      (l: HabitLog) => l.habitId === habit.id && l.logDate >= periodStart
    );

    const current = logs.reduce((sum, l) => sum + l.value, 0);
    const remaining = Math.max(0, habit.targetValue - current);
    const exceeded = current >= habit.targetValue;

    return { current, remaining, exceeded };
  };

  const selectedHabit =
    filteredHabits.find((h) => h.id === selectedHabitId) ??
    filteredHabits[0] ??
    null;

  const selectedProgress = selectedHabit ? getProgress(selectedHabit) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Habits" subtitle={`${habits.length} tracked`} />

      {selectedHabit && selectedProgress ? (
        <View style={styles.circleSection}>
          <Progress.Circle
            size={250}
            progress={Math.min(
              selectedProgress.current / selectedHabit.targetValue,
              1
            )}
            showsText={true}
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
          <Text
            variant="bodySmall"
            style={{
              color: selectedProgress.exceeded ? '#16A34A' : '#DC2626',
            }}
          >
            {selectedProgress.exceeded
              ? 'Target met!'
              : `${selectedProgress.remaining} remaining`}
          </Text>
        </View>
      ) : null}

      <Button
        mode="contained"
        onPress={() => router.push({ pathname: '../habit/add' })}
        style={styles.addButton}
      >
        Add Habit
      </Button>

      <Searchbar
        placeholder="Search by habit name or category"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {yearOptions.map((year) => (
          <Chip
            key={year}
            selected={selectedYear === year}
            onPress={() => setSelectedYear(year)}
            style={styles.chip}
          >
            {year}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHabits.length === 0 ? (
          <Text style={styles.emptyText}>No habits match your filters</Text>
        ) : (
          filteredHabits.map((habit: Habit) => {
            const { exceeded } = getProgress(habit);
            const isSelected = selectedHabit?.id === habit.id;

            return (
              <Card
                key={habit.id}
                mode="outlined"
                onPress={() => setSelectedHabitId(habit.id)}
                onLongPress={() =>
                  router.push({
                    pathname: '../habit/[id]',
                    params: { id: habit.id.toString() },
                  })
                }
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <Card.Content>
                  <Text variant="titleMedium">{habit.name}</Text>
                  <Text style={styles.meta}>
                    {getCategoryName(habit.categoryId)} •{' '}
                    {getHabitYear(habit.createdAt)}
                  </Text>
                  <Text
                    style={[
                      styles.meta,
                      { color: exceeded ? '#16A34A' : '#64748B' },
                    ]}
                  >
                    {habit.targetType} target: {habit.targetValue}
                  </Text>
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
    marginBottom: 8,
  },
  searchbar: {
    marginTop: 10,
    marginBottom: 10,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 6,
  },
  chip: {
    marginRight: 8,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  emptyText: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 8,
    textAlign: 'center',
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
    marginTop: 4,
  },
});