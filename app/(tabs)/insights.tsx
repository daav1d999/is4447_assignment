import { AppContext, Habit, HabitLog } from '@/app/_layout';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { Card, Chip, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

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
        const total = habitLogs
          .filter((l: HabitLog) => l.logDate === dateStr)
          .reduce((s, l) => s + l.value, 0);
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
        const total = habitLogs
          .filter((l: HabitLog) => l.logDate >= startStr && l.logDate <= endStr)
          .reduce((s, l) => s + l.value, 0);
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
      const total = habitLogs
        .filter((l: HabitLog) => l.logDate.startsWith(monthStr))
        .reduce((s, l) => s + l.value, 0);
      data.push(total);
    }
    return { labels, data };
  };

  const { labels, data } = getLabelsAndData();

  const lineData = labels.map((label, index) => ({
    value: data[index],
    label,
    dataPointText: String(data[index]),
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text variant="bodyMedium" style={styles.pageSubtitle}>
        Your habit analytics
      </Text>

      <View style={styles.chipRow}>
        {[
          { label: 'Daily', value: 'daily' },
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
        ].map((item) => (
          <Chip
            key={item.value}
            selected={view === item.value}
            onPress={() => setView(item.value as 'daily' | 'weekly' | 'monthly')}
            style={view === item.value ? styles.chipSelected : styles.chip}
            textStyle={view === item.value ? styles.chipTextSelected : styles.chipText}
          >
            {item.label}
          </Chip>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Card mode="outlined" style={styles.chartCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.chartTitle}>
              Activity Overview
            </Text>
            <Text variant="bodySmall" style={styles.chartSubtitle}>
              {view.charAt(0).toUpperCase() + view.slice(1)} habit activity
            </Text>

            {data.every((d) => d === 0) ? (
              <Text style={styles.emptyText}>No log data for this period.</Text>
            ) : (
              <View style={styles.chartWrap}>
                <LineChart
                  data={lineData}
                  height={220}
                  spacing={50}
                  initialSpacing={12}
                  endSpacing={12}
                  thickness={3}
                  color="#177AD5"
                  dataPointsColor="#177AD5"
                  dataPointsRadius={5}
                  textColor1="#64748B"
                  textFontSize={12}
                  yAxisThickness={0}
                  xAxisThickness={0}
                  hideRules
                  curved
                  areaChart
                  startFillColor="#177AD5"
                  endFillColor="#177AD5"
                  startOpacity={0.22}
                  endOpacity={0.04}
                  hideYAxisText
                  showVerticalLines={false}
                />
              </View>
            )}
          </Card.Content>
        </Card>

        <Card mode="outlined" style={styles.summaryCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              Habits Summary
            </Text>
            {habits.map((habit: Habit) => {
              const count = habitLogs.filter((l: HabitLog) => l.habitId === habit.id).length;
              return (
                <View key={habit.id} style={styles.summaryRow}>
                  <Text variant="bodyMedium" style={styles.summaryName}>
                    {habit.name}
                  </Text>
                  <Text variant="bodyMedium" style={styles.summaryCount}>
                    {count} logs
                  </Text>
                </View>
              );
            })}
          </Card.Content>
        </Card>
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
  content: {
    paddingBottom: 24,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#0F172A',
  },
  chipText: {
    color: '#334155',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
  },
  chartTitle: {
    color: '#0F172A',
    marginBottom: 4,
  },
  chartSubtitle: {
    color: '#64748B',
    marginBottom: 16,
  },
  chartWrap: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    marginTop: 20,
  },
  summaryCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
  },
  summaryTitle: {
    marginBottom: 10,
    color: '#0F172A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryName: {
    color: '#334155',
    flex: 1,
    marginRight: 12,
  },
  summaryCount: {
    color: '#64748B',
  },
  pageSubtitle: {
    color: '#64748B',
    marginBottom: 10,
    fontSize: 16,
  },
});