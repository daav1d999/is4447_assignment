import { AppContext, Category } from '@/app/_layout';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddHabit() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [targetType, setTargetType] = useState('weekly');
  const [targetValue, setTargetValue] = useState('');
  const [logType, setLogType] = useState('boolean');
  const [error, setError] = useState('');

  if (!context) return null;
  const { currentUser, categories, setHabits } = context;
  if (!currentUser) return null;

  const saveHabit = async () => {
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!selectedCategoryId) { setError('Select a category.'); return; }
    if (!targetValue.trim()) { setError('Enter a target value.'); return; }

    await db.insert(habitsTable).values({
      userId: currentUser.id,
      categoryId: selectedCategoryId,
      name: name.trim(),
      description: description.trim() || null,
      targetType,
      targetValue: Number(targetValue) || 1,
      logType,
      archived: 0,
      createdAt: new Date().toISOString(),
    });
    const rows = await db.select().from(habitsTable);
    setHabits(rows.filter((r) => r.userId === currentUser.id));
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ScreenHeader title="Add Habit" subtitle="Create a new habit." />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.form}>
          <TextInput label="Name" value={name} onChangeText={setName} placeholder="Habit name" mode="outlined" style={styles.input} />
          <TextInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional" mode="outlined" style={styles.input} />

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

          <TextInput label="Target Value" value={targetValue} onChangeText={setTargetValue} placeholder="e.g. 5" mode="outlined" keyboardType="numeric" style={styles.input} />

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
        <Button mode="contained" onPress={saveHabit}>Save Habit</Button>
        <Button mode="outlined" onPress={() => router.back()} style={styles.cancelButton}>Cancel</Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  input: { marginBottom: 12 },
  error: { color: '#DC2626', marginBottom: 10 },
  label: { color: '#334155', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chipSelected: { backgroundColor: '#0F172A' },
  cancelButton: { marginTop: 10 },
});