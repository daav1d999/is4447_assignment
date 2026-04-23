import { AppContext, Category } from '@/app/_layout';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, Snackbar, Text, TextInput } from 'react-native-paper';
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
    if (!name.trim()) { setError('Enter a habit name.'); return; }
    if (!selectedCategoryId) { setError('Select a category.'); return; }
    if (!targetValue.trim()) { setError('Enter a target value.'); return; }
    try {
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
    } catch {
      setError('Failed to save habit. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Add Habit</Text>

        <TextInput label="Name" value={name} onChangeText={setName} placeholder="Habit name" mode="outlined" accessibilityLabel="Habit name input" style={styles.input} />
        <TextInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional description" mode="outlined" accessibilityLabel="Habit description input" style={styles.input} />

        <Text variant="labelMedium" style={styles.label}>Category</Text>
        {categories.length === 0 ? (
          <Text variant="bodySmall" style={styles.hintText}>No categories yet. Create one in the Categories tab first.</Text>
        ) : (
          <View style={styles.chipRow}>
            {categories.map((cat: Category) => (
              <Chip
                key={cat.id}
                selected={selectedCategoryId === cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                accessibilityLabel={`Select category ${cat.name}`}
                style={selectedCategoryId === cat.id ? { backgroundColor: cat.color ?? '#0F766E' } : undefined}
                textStyle={selectedCategoryId === cat.id ? { color: '#FFFFFF' } : undefined}
              >
                {cat.name}
              </Chip>
            ))}
          </View>
        )}

        <Text variant="labelMedium" style={styles.label}>Target Period</Text>
        <View style={styles.chipRow}>
          {['weekly', 'monthly'].map((t) => (
            <Chip key={t} selected={targetType === t} onPress={() => setTargetType(t)} accessibilityLabel={`Set target period to ${t}`}>
              {t}
            </Chip>
          ))}
        </View>

        <TextInput label="Target Value" value={targetValue} onChangeText={setTargetValue} placeholder="e.g. 5" mode="outlined" keyboardType="numeric" accessibilityLabel="Target value input" style={styles.input} />

        <Text variant="labelMedium" style={styles.label}>Log Type</Text>
        <View style={styles.chipRow}>
          {['boolean', 'count'].map((t) => (
            <Chip key={t} selected={logType === t} onPress={() => setLogType(t)} accessibilityLabel={`Set log type to ${t === 'boolean' ? 'yes or no' : 'count'}`}>
              {t === 'boolean' ? 'Yes/No' : 'Count'}
            </Chip>
          ))}
        </View>

        <Button mode="contained" onPress={saveHabit} accessibilityLabel="Save new habit">Save Habit</Button>
        <Button mode="outlined" onPress={() => router.back()} accessibilityLabel="Cancel and go back" style={styles.spacing}>Cancel</Button>
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000} action={{ label: 'OK', onPress: () => setError('') }}>
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  content: { padding: 20 },
  title: { color: '#0F172A', marginBottom: 16 },
  input: { marginBottom: 12 },
  label: { color: '#334155', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  hintText: { color: '#94A3B8', marginBottom: 12 },
  spacing: { marginTop: 10 },
});