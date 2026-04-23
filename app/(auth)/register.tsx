import { AppContext } from '@/app/_layout';
import { db } from '@/db/client';
import { users as usersTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useContext, useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const context = useContext(AppContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!context) return null;
  const { setCurrentUser } = context;

  const handleRegister = async () => {
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);

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
      if (newUser) setCurrentUser(newUser);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
        <Text variant="headlineLarge" style={styles.brand}>HabitAware</Text>
        <Text variant="bodyLarge" style={styles.subtitle}>Create your account</Text>

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          mode="outlined"
          accessibilityLabel="Name input"
          style={styles.input}
        />

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
          placeholder="Choose a password"
          mode="outlined"
          secureTextEntry
          accessibilityLabel="Password input"
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          accessibilityLabel="Create your account"
          style={styles.button}
        >
          Register
        </Button>

        <View style={styles.linkRow}>
          <Text variant="bodyMedium">Already have an account? </Text>
          <Button
            mode="text"
            onPress={() => router.back()}
            accessibilityLabel="Go to login page"
            compact
          >
            Log In
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
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  logo: {
    width: 72,
    height: 72,
    alignSelf: 'center',
    marginBottom: 12,
  },
  brand: {
    textAlign: 'center',
    color: '#0F766E',
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    color: '#64748B',
    marginBottom: 30,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
});