import { AppContext } from '@/app/_layout';
import { db } from '@/db/client';
import { categories as categoriesTable, habitLogs as habitLogsTable, habits as habitsTable, users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  if (!context || !context.currentUser) return null;
  const { currentUser, setCurrentUser } = context;

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Profile',
      'This will permanently delete your account and all data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const userHabits = await db.select().from(habitsTable).where(eq(habitsTable.userId, currentUser.id));
            for (const habit of userHabits) {
              await db.delete(habitLogsTable).where(eq(habitLogsTable.habitId, habit.id));
            }
            await db.delete(habitsTable).where(eq(habitsTable.userId, currentUser.id));
            await db.delete(categoriesTable).where(eq(categoriesTable.userId, currentUser.id));
            await db.delete(usersTable).where(eq(usersTable.id, currentUser.id));
            setCurrentUser(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text variant="headlineMedium" style={styles.title}>Profile</Text>

      <Card mode="outlined" style={styles.card}>
        <Card.Content>
          <Text variant="bodyLarge">Name: {currentUser.name}</Text>
          <Text variant="bodyLarge">Email: {currentUser.email}</Text>
        </Card.Content>
      </Card>

      <Button mode="outlined" onPress={handleLogout} style={styles.button}>Log Out</Button>
      <Button mode="outlined" textColor="#DC2626" onPress={handleDelete} style={styles.button}>Delete Profile</Button>
      <Button mode="text" onPress={() => router.back()} style={styles.button}>Back</Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1, padding: 20 },
  title: { marginBottom: 20 },
  card: { marginBottom: 20 },
  button: { marginTop: 10 },
});