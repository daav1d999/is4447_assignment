import { AppContext, Habit, HabitLog } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  Chip,
  Searchbar,
  Text,
} from 'react-native-paper';
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

  const categoryOptions = [
    'All',
    ...categories.map((category) => category.name),
  ];

  const dateRangeOptions = ['All', 'Last 7 Days', 'Last 30 Days'];

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : 'Unknown';
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

      if (selectedDateRange === 'Last 7 Days') {
        startDate.setDate(today.getDate() - 7);
      }

      if (selectedDateRange === 'Last 30 Days') {
        startDate.setDate(today.getDate() - 30);
      }

      const startDateString = startDate.toISOString().split('T')[0];

      matchesDateRange = habitLogs.some(
        (log: HabitLog) =>
          log.habitId === habit.id && log.logDate >= startDateString
      );
    }

    return matchesSearch && matchesCategory && matchesDateRange;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text variant="bodyMedium" style={styles.pageSubtitle}>
  Track, filter, and manage your habits
</Text>

      <Searchbar
        placeholder="Search by habit name or category"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterRow}>
        {categoryOptions.map((category) => (
          <Chip
            key={category}
            selected={selectedCategory === category}
            onPress={() => setSelectedCategory(category)}
            style={styles.chip}
            compact
          >
            {category}
          </Chip>
        ))}
      </View>

      <View style={styles.filterRow}>
        {dateRangeOptions.map((range) => (
          <Chip
            key={range}
            selected={selectedDateRange === range}
            onPress={() => setSelectedDateRange(range)}
            style={styles.chip}
            compact
          >
            {range}
          </Chip>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={() => router.push({ pathname: '../habit/add' })}
        style={styles.addButton}
      >
        Add Habit
      </Button>

      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredHabits.length === 0 ? (
          <Text style={styles.emptyText}>No habits match your filters</Text>
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
              style={styles.card}
            >
              <Card.Content>
                <Text variant="titleMedium">{habit.name}</Text>
                <Text style={styles.meta}>
                  {getCategoryName(habit.categoryId)}
                </Text>
                <Text style={styles.meta}>
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
    paddingTop: 0,
  },
  searchbar: {
    marginTop: 5,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  addButton: {
    marginBottom: 10,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 4,
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
  meta: {
    color: '#64748B',
    marginTop: 4,
  },

  pageSubtitle: {
  color: '#64748B',
  marginBottom: 10,
},
});