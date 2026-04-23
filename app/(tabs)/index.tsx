import { AppContext, Habit, HabitLog } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Searchbar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('All');

  if (!context) return null;
  const { habits, categories, habitLogs } = context;
  const normalizedQuery = searchQuery.trim().toLowerCase();

  const categoryOptions = ['All', ...categories.map((c) => c.name)];
  const dateRangeOptions = ['All', 'Last 7 Days', 'Last 30 Days'];

  const getCategoryName = (categoryId: number): string => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : 'Unknown';
  };

  const filteredHabits = habits.filter((habit: Habit) => {
    const categoryName = getCategoryName(habit.categoryId);
    const matchesSearch =
      normalizedQuery.length === 0 ||
      habit.name.toLowerCase().includes(normalizedQuery) ||
      categoryName.toLowerCase().includes(normalizedQuery);

    const matchesCategory =
      selectedCategory === 'All' || categoryName === selectedCategory;

    let matchesDateRange = true;

    if (selectedDateRange !== 'All') {
      const today = new Date();
      const startDate = new Date();

      if (selectedDateRange === 'Last 7 Days') startDate.setDate(today.getDate() - 7);
      if (selectedDateRange === 'Last 30 Days') startDate.setDate(today.getDate() - 30);

      const startDateString = startDate.toISOString().split('T')[0];

      matchesDateRange = habitLogs.some(
        (log: HabitLog) => log.habitId === habit.id && log.logDate >= startDateString
      );
    }

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Track, filter, and manage your habits
      </Text>

      <Searchbar
        placeholder="Search by habit name or category"
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search habits"
        style={styles.searchbar}
      />

      <View style={styles.filtersSection}>
        <Text variant="labelMedium" style={styles.filterLabel}>
          Category
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categoryOptions.map((cat) => (
            <Chip
              key={cat}
              selected={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
              accessibilityLabel={`Filter by category ${cat}`}
              style={styles.chip}
              compact
            >
              {cat}
            </Chip>
          ))}
        </ScrollView>

        <Text variant="labelMedium" style={styles.filterLabel}>
          Date Range
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {dateRangeOptions.map((range) => (
            <Chip
              key={range}
              selected={selectedDateRange === range}
              onPress={() => setSelectedDateRange(range)}
              accessibilityLabel={`Filter by date range ${range}`}
              style={styles.chip}
              compact
            >
              {range}
            </Chip>
          ))}
        </ScrollView>
      </View>

      <Button
        mode="contained"
        onPress={() => router.push({ pathname: '../habit/add' })}
        accessibilityLabel="Add a new habit"
        style={styles.addButton}
      >
        Add Habit
      </Button>

      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No habits yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyBody}>
              Tap "Add Habit" to start tracking your first habit.
            </Text>
          </View>
        ) : filteredHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No results
            </Text>
            <Text variant="bodyMedium" style={styles.emptyBody}>
              Try changing your search or filters.
            </Text>
          </View>
        ) : (
          filteredHabits.map((habit: Habit) => (
            <Card
              key={habit.id}
              mode="outlined"
              onPress={() =>
                router.push({
                  pathname: '../habit/[id]',
                  params: { id: habit.id.toString() },
                })
              }
              accessibilityLabel={`View details for ${habit.name}`}
              style={styles.card}
            >
              <Card.Content>
                <Text variant="titleMedium">{habit.name}</Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {getCategoryName(habit.categoryId)}
                </Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {habit.targetType} target: {habit.targetValue}
                </Text>
              </Card.Content>
            </Card>
          ))
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
  },
  subtitle: {
    color: '#64748B',
    marginBottom: 12,
  },
  searchbar: {
    marginBottom: 14,
  },
  filtersSection: {
    marginBottom: 14,
  },
  filterLabel: {
    color: '#475569',
    marginBottom: 8,
  },
  filterRow: {
    paddingBottom: 12,
    paddingRight: 8,
  },
  chip: {
    marginRight: 8,
  },
  addButton: {
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    marginBottom: 12,
  },
  meta: {
    color: '#64748B',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyTitle: {
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyBody: {
    color: '#64748B',
    textAlign: 'center',
  },
});