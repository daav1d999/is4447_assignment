import { AppContext } from '@/app/_layout';
import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!context) return null;
  const { setCurrentUser } = context;

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      const results = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email.trim().toLowerCase()));
      const user = results[0];
      if (!user || user.passwordHash !== password) {
        setError('Invalid email or password.');
        return;
      }
      setCurrentUser(user);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineLarge" style={styles.brand}>HabitAware</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Track your habits, reach your goals</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          accessibilityLabel="Email address input"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          mode="outlined"
          secureTextEntry
          accessibilityLabel="Password input"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          accessibilityLabel="Log in to your account"
          style={styles.button}
        >
          Log In
        </Button>

        <View style={styles.linkRow}>
          <Text variant="bodyMedium">Don't have an account? </Text>
          <Button
            mode="text"
            onPress={() => router.push('/(auth)/register' as any)}
            accessibilityLabel="Go to registration page"
            compact
          >
            Register
          </Button>
        </View>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
        action={{ label: 'OK', onPress: () => setError('') }}
      >
        {error}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  content: { padding: 20, paddingTop: 80 },
  brand: { textAlign: 'center', color: '#0F766E', fontWeight: '700', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#64748B', marginBottom: 30 },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});