import { AppContext } from '@/app/_layout';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
;

export default function AddHabit() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState('weekly');
  const [targetValue, setTargetValue] = useState('');
  const [logType, setLogType] = useState('boolean');

  if (!context) return null;
  const { setHabits, categories } = context;

  const saveHabit = async () => {
    const firstCategory = categories[0];
    if (!firstCategory) return;

    await db.insert(habitsTable).values({
      userId: 1,
      categoryId: firstCategory.id,
      name,
      description,
      targetType,
      targetValue: Number(targetValue) || 1,
      logType,
      archived: 0,
      createdAt: new Date().toISOString(),
    });
    const rows = await db.select().from(habitsTable);
    setHabits(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Add Habit" subtitle="Create a new habit." />
      <View style={styles.form}>
        <FormField label="Name" value={name} onChangeText={setName} />
        <FormField label="Description" value={description} onChangeText={setDescription} />
        <FormField label="Target Type" value={targetType} onChangeText={setTargetType} />
        <FormField label="Target Value" value={targetValue} onChangeText={setTargetValue} />
        <FormField label="Log Type" value={logType} onChangeText={setLogType} />
      </View>
      <PrimaryButton label="Save Habit" onPress={saveHabit} />
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