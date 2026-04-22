import { AppContext } from '@/app/_layout';
import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!context) return null;
  const { setCurrentUser } = context;

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
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
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>Habit Tracker</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Log in to continue</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        <Button mode="contained" onPress={handleLogin} style={styles.button}>Log In</Button>
        <View style={styles.linkRow}>
          <Text variant="bodyMedium">Don't have an account? </Text>
          <Button mode="text" onPress={() => router.push('/(auth)/register' as any)} compact>Register</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F8FAFC', flex: 1 },
  content: { padding: 20, paddingTop: 80 },
  title: { textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: '#475569', marginBottom: 30 },
  error: { color: '#DC2626', marginBottom: 10, textAlign: 'center' },
  input: { marginBottom: 12 },
  button: { marginTop: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 },
});