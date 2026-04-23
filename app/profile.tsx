import { AppContext } from '@/app/_layout';
import { db } from '@/db/client';
import {
  categories as categoriesTable,
  habitLogs as habitLogsTable,
  habits as habitsTable,
  users as usersTable,
} from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Text } from 'react-native-paper';
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
            const userHabits = await db
              .select()
              .from(habitsTable)
              .where(eq(habitsTable.userId, currentUser.id));

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
      <Text variant="bodyMedium" style={styles.subtitle}>
        Manage your account settings
      </Text>

      <Card mode="outlined" style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={64}
              label={currentUser.name.slice(0, 1).toUpperCase()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.profileText}>
              <Text variant="titleLarge" style={styles.name}>
                {currentUser.name}
              </Text>
              <Text variant="bodyMedium" style={styles.email}>
                {currentUser.email}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card mode="outlined" style={styles.actionsCard}>
        <Card.Content style={styles.actionsContent}>
          <Text variant="titleMedium" style={styles.actionsTitle}>
            Actions
          </Text>

          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.primaryButton}
            accessibilityLabel="Log out of your account"
          >
            Log Out
          </Button>

          <Button
            mode="outlined"
            textColor="#B91C1C"
            onPress={handleDelete}
            style={styles.secondaryButton}
            accessibilityLabel="Delete your profile"
          >
            Delete Profile
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            Back
          </Button>
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 16,
    marginTop: 12,
    marginBottom: 18,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 18,
    borderRadius: 18,
  },
  profileContent: {
    paddingVertical: 10,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  avatar: {
    backgroundColor: '#CCFBF1',
  },
  avatarLabel: {
    color: '#0F766E',
    fontWeight: '700',
  },
  profileText: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    color: '#0F172A',
    marginBottom: 6,
  },
  email: {
    color: '#64748B',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
  },
  actionsContent: {
    paddingVertical: 10,
  },
  actionsTitle: {
    color: '#0F172A',
    marginBottom: 16,
  },
  primaryButton: {
    marginBottom: 14,
  },
  secondaryButton: {
    borderColor: '#FCA5A5',
    marginBottom: 10,
  },
  backButton: {
    marginTop: 6,
  },
});