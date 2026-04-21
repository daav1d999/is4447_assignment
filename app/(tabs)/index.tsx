import { AppContext, Habit } from '@/app/_layout';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  if (!context) return null;
  const { habits } = context;
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader
        title="Habits"
        subtitle={`${habits.length} tracked`}
      />
      <PrimaryButton
        label="Add Habit"
        onPress={() => router.push({ pathname: '../habit/add' })}
      />
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {habits.map((habit: Habit) => (
          <Pressable
            key={habit.id}
            accessibilityLabel={`${habit.name}, view details`}
            accessibilityRole="button"
            onPress={() =>
              router.push({
                pathname: '../habit/[id]',
                params: { id: habit.id.toString() },
              })
            }
            style={({ pressed }) => [
              styles.card,
              pressed ? styles.cardPressed : null,
            ]}
          >
            <Text style={styles.name}>{habit.name}</Text>
          </Pressable>
        ))}
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
  listContent: {
    paddingBottom: 24,
    paddingTop: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  name: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '700',
  },
});