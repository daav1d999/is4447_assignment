import { AppContext, Category } from '@/app/_layout';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import ScreenHeader from '@/components/ui/screen-header';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#22C55E');
  const [editingId, setEditingId] = useState<number | null>(null);

  if (!context) return null;
  const { categories, setCategories } = context;

  const resetForm = () => {
    setName('');
    setSelectedColor('#22C55E');
    setEditingId(null);
  };

  const saveCategory = async () => {
    if (!name.trim()) return;

    if (editingId) {
      await db
        .update(categoriesTable)
        .set({ name: name.trim(), color: selectedColor })
        .where(eq(categoriesTable.id, editingId));
    } else {
      await db.insert(categoriesTable).values({
        userId: 1,
        name: name.trim(),
        color: selectedColor,
        createdAt: new Date().toISOString(),
      });
    }

    const rows = await db.select().from(categoriesTable);
    setCategories(rows);
    resetForm();
  };

  const startEdit = (cat: Category) => {
    setName(cat.name);
    setSelectedColor(cat.color ?? '#22C55E');
    setEditingId(cat.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Categories" subtitle={`${categories.length} categories`} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <FormField
            label={editingId ? 'Edit Category' : 'New Category'}
            value={name}
            onChangeText={setName}
            placeholder="Category name"
          />
          <Text style={styles.label}>Colour</Text>
          <View style={styles.colorRow}>
            {['#22C55E', '#3B82F6', '#F97316', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F59E0B'].map((color) => (
              <Pressable
                key={color}
                accessibilityLabel={`Select colour ${color}`}
                accessibilityRole="button"
                onPress={() => setSelectedColor(color)}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  selectedColor === color && styles.colorDotSelected,
                ]}
              />
            ))}
          </View>
          <PrimaryButton label={editingId ? 'Update' : 'Add Category'} onPress={saveCategory} />
          {editingId ? (
            <View style={styles.cancelButton}>
              <PrimaryButton label="Cancel" variant="secondary" onPress={resetForm} />
            </View>
          ) : null}
        </View>

        {categories.map((cat: Category) => (
          <Pressable
            key={cat.id}
            accessibilityLabel={`${cat.name}, tap to edit`}
            accessibilityRole="button"
            onPress={() => startEdit(cat)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={[styles.dot, { backgroundColor: cat.color ?? '#94A3B8' }]} />
            <Text style={styles.catName}>{cat.name}</Text>
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
  form: {
    marginBottom: 10,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  colorDot: {
    borderRadius: 16,
    height: 32,
    width: 32,
  },
  colorDotSelected: {
    borderColor: '#0F172A',
    borderWidth: 3,
  },
  cancelButton: {
    marginTop: 10,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  cardPressed: {
    opacity: 0.88,
  },
  dot: {
    borderRadius: 6,
    height: 12,
    marginRight: 10,
    width: 12,
  },
  catName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});