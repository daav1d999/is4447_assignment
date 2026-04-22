import { AppContext, Category, Habit } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditHabit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const context = useContext(AppContext);
  if (!context) return null;
  const { currentUser, habits, setHabits, categories } = context;
  if (!currentUser) return null;

  const habit = habits.find((h: Habit) => h.id === Number(id));
  if (!habit) return null;

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(habit.categoryId);
  const [targetType, setTargetType] = useState(habit.targetType);
  const [targetValue, setTargetValue] = useState(String(habit.targetValue));
  const [logType, setLogType] = useState(habit.logType);

  const saveChanges = async () => {
    await db
      .update(habitsTable)
      .set({
        name: name.trim(),
        description: description.trim() || null,
        categoryId: selectedCategoryId,
        targetType,
        targetValue: Number(targetValue) || 1,
        logType,
      })
      .where(eq(habitsTable.id, Number(id)));
    const rows = await db.select().from(habitsTable);
    setHabits(rows.filter((r) => r.userId === currentUser.id));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ScreenHeader title="Edit Habit" subtitle={habit.name} />
        <View style={styles.form}>
          <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
          <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" style={styles.input} />

          <Text variant="labelMedium" style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((cat: Category) => (
              <Chip
                key={cat.id}
                selected={selectedCategoryId === cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={selectedCategoryId === cat.id ? { backgroundColor: cat.color ?? '#0F766E' } : undefined}
                textStyle={selectedCategoryId === cat.id ? { color: '#FFFFFF' } : undefined}
              >
                {cat.name}
              </Chip>
            ))}
          </View>

          <Text variant="labelMedium" style={styles.label}>Target Period</Text>
          <View style={styles.chipRow}>
            {['weekly', 'monthly'].map((t) => (
              <Chip
                key={t}
                selected={targetType === t}
                onPress={() => setTargetType(t)}
                style={targetType === t ? styles.chipSelected : undefined}
                textStyle={targetType === t ? { color: '#FFFFFF' } : undefined}
              >
                {t}
              </Chip>
            ))}
          </View>

          <TextInput label="Target Value" value={targetValue} onChangeText={setTargetValue} mode="outlined" keyboardType="numeric" style={styles.input} />

          <Text variant="labelMedium" style={styles.label}>Log Type</Text>
          <View style={styles.chipRow}>
            {['boolean', 'count'].map((t) => (
              <Chip
                key={t}
                selected={logType === t}
                onPress={() => setLogType(t)}
                style={logType === t ? styles.chipSelected : undefined}
                textStyle={logType === t ? { color: '#FFFFFF' } : undefined}
              >
                {t === 'boolean' ? 'Yes/No' : 'Count'}
              </Chip>
            ))}
          </View>
        </View>
        <Button mode="contained" onPress={saveChanges}>Save Changes</Button>
        <Button mode="outlined" onPress={() => router.back()} style={styles.cancelButton}>Cancel</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  input: { marginBottom: 12 },
  label: { color: '#334155', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chipSelected: { backgroundColor: '#0F172A' },
  cancelButton: { marginTop: 10 },
});