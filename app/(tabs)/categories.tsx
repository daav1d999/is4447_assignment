import { AppContext, Category } from '@/app/_layout';
import { db } from '@/db/client';
import { categories as categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useContext, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CategoriesScreen() {
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#22C55E');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  if (!context) return null;
  const { currentUser, categories, setCategories } = context;
  if (!currentUser) return null;

  const resetForm = () => {
    setName('');
    setSelectedColor('#22C55E');
    setEditingId(null);
  };

  const saveCategory = async () => {
    if (!name.trim()) {
      setError('Please enter a category name.');
      return;
    }
    try {
      if (editingId) {
        await db.update(categoriesTable).set({ name: name.trim(), color: selectedColor }).where(eq(categoriesTable.id, editingId));
      } else {
        await db.insert(categoriesTable).values({
          userId: currentUser.id,
          name: name.trim(),
          color: selectedColor,
          createdAt: new Date().toISOString(),
        });
      }
      const rows = await db.select().from(categoriesTable);
      setCategories(rows.filter((r) => r.userId === currentUser.id));
      resetForm();
    } catch {
      setError('Failed to save category. Please try again.');
    }
  };

  const deleteCategory = async () => {
    if (!editingId) return;
    try {
      await db.delete(categoriesTable).where(eq(categoriesTable.id, editingId));
      const rows = await db.select().from(categoriesTable);
      setCategories(rows.filter((r) => r.userId === currentUser.id));
      resetForm();
    } catch {
      setError('Failed to delete category.');
    }
  };

  const startEdit = (cat: Category) => {
    setName(cat.name);
    setSelectedColor(cat.color ?? '#22C55E');
    setEditingId(cat.id);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text variant="bodyMedium" style={styles.subtitle}>Create and manage your categories</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <TextInput
            label={editingId ? 'Edit Category' : 'New Category'}
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            mode="outlined"
            accessibilityLabel={editingId ? 'Edit category name' : 'New category name'}
            style={styles.input}
          />
          <Text variant="labelMedium" style={styles.label}>Colour</Text>
          <View style={styles.colorRow}>
            {['#22C55E', '#3B82F6', '#F97316', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F59E0B'].map((color) => (
              <Pressable
                key={color}
                accessibilityLabel={`Select colour ${color}`}
                accessibilityRole="button"
                onPress={() => setSelectedColor(color)}
                style={[styles.colorDot, { backgroundColor: color }, selectedColor === color && styles.colorDotSelected]}
              />
            ))}
          </View>
          <Button mode="contained" onPress={saveCategory} accessibilityLabel={editingId ? 'Update category' : 'Add new category'}>
            {editingId ? 'Update' : 'Add Category'}
          </Button>
          {editingId ? (
            <>
              <Button mode="outlined" onPress={resetForm} accessibilityLabel="Cancel editing" style={styles.spacing}>Cancel</Button>
              <Button mode="outlined" textColor="#DC2626" onPress={deleteCategory} accessibilityLabel="Delete this category" style={styles.spacing}>Delete Category</Button>
            </>
          ) : null}
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="titleMedium" style={styles.emptyTitle}>No categories yet</Text>
            <Text variant="bodyMedium" style={styles.emptyBody}>Add your first category above to start organising habits.</Text>
          </View>
        ) : (
          categories.map((cat: Category) => (
            <Card key={cat.id} mode="outlined" onPress={() => startEdit(cat)} accessibilityLabel={`Edit category ${cat.name}`} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={[styles.dot, { backgroundColor: cat.color ?? '#94A3B8' }]} />
                <Text variant="titleMedium">{cat.name}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000} action={{ label: 'OK', onPress: () => setError('') }}>
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, paddingHorizontal: 18, paddingTop: 10 },
  subtitle: { color: '#64748B', marginBottom: 10 },
  form: { marginBottom: 10 },
  input: { marginBottom: 12 },
  label: { color: '#334155', marginBottom: 6 },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  colorDot: { borderRadius: 16, height: 32, width: 32 },
  colorDotSelected: { borderColor: '#0F172A', borderWidth: 3 },
  spacing: { marginTop: 10 },
  card: { marginBottom: 12 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  dot: { borderRadius: 6, height: 12, marginRight: 10, width: 12 },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { color: '#0F172A', marginBottom: 8 },
  emptyBody: { color: '#64748B', textAlign: 'center' },
});