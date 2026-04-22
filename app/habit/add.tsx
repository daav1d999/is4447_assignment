import { AppContext, Category } from '@/app/_layout';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { habits as habitsTable } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const { categories, setHabits } = context;

  const saveHabit = async () => {
    if (!name.trim()) { setError('Enter a name.'); return; }
    if (!selectedCategoryId) { setError('Select a category.'); return; }
    if (!targetValue.trim()) { setError('Enter a target value.'); return; }

    await db.insert(habitsTable).values({
      userId: 1,
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
    setHabits(rows);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <ScreenHeader title="Add Habit" subtitle="Create a new habit." />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.form}>
          <FormField label="Name" value={name} onChangeText={setName} placeholder="Habit name" />
          <FormField label="Description" value={description} onChangeText={setDescription} placeholder="Optional" />

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipRow}>
            {categories.map((cat: Category) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategoryId(cat.id)}
                style={[
                  styles.chip,
                  selectedCategoryId === cat.id && { backgroundColor: cat.color ?? '#0F766E', borderColor: cat.color ?? '#0F766E' },
                ]}
              >
                <Text style={[styles.chipText, selectedCategoryId === cat.id && { color: '#FFFFFF' }]}>{cat.name}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Target Period</Text>
          <View style={styles.chipRow}>
            {['weekly', 'monthly'].map((t) => (
              <Pressable key={t} onPress={() => setTargetType(t)} style={[styles.chip, targetType === t && styles.chipSelected]}>
                <Text style={[styles.chipText, targetType === t && { color: '#FFFFFF' }]}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <FormField label="Target Value" value={targetValue} onChangeText={setTargetValue} placeholder="e.g. 5" />

          <Text style={styles.label}>Log Type</Text>
          <View style={styles.chipRow}>
            {['boolean', 'count'].map((t) => (
              <Pressable key={t} onPress={() => setLogType(t)} style={[styles.chip, logType === t && styles.chipSelected]}>
                <Text style={[styles.chipText, logType === t && { color: '#FFFFFF' }]}>{t === 'boolean' ? 'Yes/No' : 'Count'}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <PrimaryButton label="Save Habit" onPress={saveHabit} />
        <View style={styles.backButton}>
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, padding: 20 },
  form: { marginBottom: 6 },
  backButton: { marginTop: 10 },
  error: { color: '#DC2626', fontSize: 14, marginBottom: 10 },
  label: { color: '#334155', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { backgroundColor: '#FFFFFF', borderColor: '#94A3B8', borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  chipSelected: { backgroundColor: '#0F172A', borderColor: '#0F172A' },
  chipText: { color: '#0F172A', fontSize: 14 },
});