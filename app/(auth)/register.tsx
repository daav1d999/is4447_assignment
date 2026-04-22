import { AppContext } from '@/app/_layout';
import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!context) return null;
  const { setCurrentUser } = context;

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()));

    if (existing.length > 0) {
      setError('An account with this email already exists.');
      return;
    }

    await db.insert(usersTable).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash: password,
      createdAt: new Date().toISOString(),
    });

    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()));

    const newUser = rows[0];
    if (newUser) {
      setCurrentUser(newUser);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Sign up to start tracking</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput label="Name" value={name} onChangeText={setName} placeholder="Your name" mode="outlined" style={styles.input} />
        <TextInput label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput label="Password" value={password} onChangeText={setPassword} placeholder="Choose a password" mode="outlined" secureTextEntry style={styles.input} />

        <Button mode="contained" onPress={handleRegister} style={styles.button}>Register</Button>

        <View style={styles.linkRow}>
          <Text variant="bodyMedium">Already have an account? </Text>
          <Button mode="text" onPress={() => router.back()} compact>Log In</Button>
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