import { AppContext, Habit, HabitLog } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { useContext, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Card, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width - 36;

export default function InsightsScreen() {
  const context = useContext(AppContext);
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  if (!context) return null;
  const { habits, habitLogs } = context;

  const getLabelsAndData = () => {
    const now = new Date();

    if (view === 'daily') {
      const labels: string[] = [];
      const data: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        labels.push(dateStr.slice(5));
        const total = habitLogs.filter((l: HabitLog) => l.logDate === dateStr).reduce((s, l) => s + l.value, 0);
        data.push(total);
      }
      return { labels, data };
    }

    if (view === 'weekly') {
      const labels: string[] = [];
      const data: number[] = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1 - i * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = weekEnd.toISOString().split('T')[0];
        labels.push(startStr.slice(5));
        const total = habitLogs.filter((l: HabitLog) => l.logDate >= startStr && l.logDate <= endStr).reduce((s, l) => s + l.value, 0);
        data.push(total);
      }
      return { labels, data };
    }

    const labels: string[] = [];
    const data: number[] = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      labels.push(monthStr.slice(5));
      const total = habitLogs.filter((l: HabitLog) => l.logDate.startsWith(monthStr)).reduce((s, l) => s + l.value, 0);
      data.push(total);
    }
    return { labels, data };
  };

  const { labels, data } = getLabelsAndData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Insights" subtitle="Your habit analytics" />

      <View style={styles.chipRow}>
        {(['daily', 'weekly', 'monthly'] as const).map((v) => (
          <Chip
            key={v}
            selected={view === v}
            onPress={() => setView(v)}
            style={view === v ? styles.chipSelected : styles.chip}
            textStyle={view === v ? { color: '#FFFFFF' } : undefined}
          >
            {v}
          </Chip>
        ))}
      </View>

      <ScrollView>
        {data.every((d) => d === 0) ? (
          <Text style={styles.emptyText}>No log data for this period.</Text>
        ) : (
          <BarChart
            data={{ labels, datasets: [{ data }] }}
            width={screenWidth}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#FFFFFF',
              backgroundGradientFrom: '#FFFFFF',
              backgroundGradientTo: '#FFFFFF',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
              labelColor: () => '#334155',
            }}
            style={{ borderRadius: 8 }}
          />
        )}

        <Card mode="outlined" style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>Habits Summary</Text>
            {habits.map((habit: Habit) => {
              const count = habitLogs.filter((l: HabitLog) => l.habitId === habit.id).length;
              return (
                <Text key={habit.id} variant="bodyMedium" style={styles.summaryRow}>
                  {habit.name}: {count} logs total
                </Text>
              );
            })}
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { backgroundColor: '#FFFFFF' },
  chipSelected: { backgroundColor: '#0F172A' },
  emptyText: { color: '#475569', textAlign: 'center', marginTop: 20 },
  summaryCard: { marginTop: 20 },
  summaryTitle: { marginBottom: 8 },
  summaryRow: { color: '#475569', marginBottom: 4 },
});