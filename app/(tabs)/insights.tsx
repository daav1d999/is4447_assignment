import { AppContext, Habit, HabitLog } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { useContext, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
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

      <View style={styles.toggleRow}>
        {(['daily', 'weekly', 'monthly'] as const).map((v) => (
          <Pressable
            key={v}
            onPress={() => setView(v)}
            style={[styles.toggle, view === v && styles.toggleSelected]}
          >
            <Text style={[styles.toggleText, view === v && { color: '#FFFFFF' }]}>{v}</Text>
          </Pressable>
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

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Habits Summary</Text>
          {habits.map((habit: Habit) => {
            const count = habitLogs.filter((l: HabitLog) => l.habitId === habit.id).length;
            return (
              <Text key={habit.id} style={styles.summaryRow}>
                {habit.name}: {count} logs total
              </Text>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  toggle: { backgroundColor: '#FFFFFF', borderColor: '#94A3B8', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  toggleSelected: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  toggleText: { color: '#0F172A', fontSize: 14 },
  emptyText: { color: '#475569', fontSize: 16, marginTop: 20, textAlign: 'center' },
  summary: { marginTop: 20 },
  summaryTitle: { color: '#111827', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  summaryRow: { color: '#475569', fontSize: 14, marginBottom: 4 },
});