import { AppContext, Habit } from '@/app/_layout';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  if (!context) return null;
  const { habits, setHabits } = context;

  const habit = habits.find((h: Habit) => h.id === Number(id));
  if (!habit) return null;

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description ?? '');
  const [targetType, setTargetType] = useState(habit.targetType);
  const [targetValue, setTargetValue] = useState(String(habit.targetValue));
  const [logType, setLogType] = useState(habit.logType);

  const saveChanges = async () => {
    await db
      .update(habitsTable)
      .set({
        name,
        description,
        targetType,
        targetValue: Number(targetValue) || 1,
        logType,
      })
      .where(eq(habitsTable.id, Number(id)));
    const rows = await db.select().from(habitsTable);
    setHabits(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Edit Habit" subtitle={habit.name} />
      <View style={styles.form}>
        <FormField label="Name" value={name} onChangeText={setName} />
        <FormField label="Description" value={description} onChangeText={setDescription} />
        <FormField label="Target Type" value={targetType} onChangeText={setTargetType} />
        <FormField label="Target Value" value={targetValue} onChangeText={setTargetValue} />
        <FormField label="Log Type" value={logType} onChangeText={setLogType} />
      </View>
      <PrimaryButton label="Save Changes" onPress={saveChanges} />
      <View style={styles.backButton}>
        <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
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
  form: {
    marginBottom: 6,
  },
  backButton: {
    marginTop: 10,
  },
});