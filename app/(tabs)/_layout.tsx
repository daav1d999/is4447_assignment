import { AppContext } from '@/app/_layout';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useNavigation, useRouter } from 'expo-router';
import { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { BottomNavigation, Text } from 'react-native-paper';

export default function TabLayout() {
  const router = useRouter();
  const navigation = useNavigation();
  const context = useContext(AppContext);

  

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitle: () => (
          <Text variant="titleMedium" style={styles.headerTitle}>
            HabitAware
          </Text>
        ),
        headerRight: () => (
          <Pressable
            onPress={() => router.push('/profile' as any)}
            accessibilityLabel="Open profile settings"
            accessibilityRole="button"
            style={styles.profileButton}
          >
            <Ionicons name="person-circle-outline" size={28} color="#0F766E" />
          </Pressable>
        ),
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.navigate(route.name);
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            if (options.tabBarIcon) {
              return options.tabBarIcon({
                focused,
                color,
                size: 24,
              });
            }
            return null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            if (typeof options.tabBarLabel === 'string') return options.tabBarLabel;
            if (typeof options.title === 'string') return options.title;
            return route.name;
          }}
        />
      )}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Habits',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkmark-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    color: '#0F766E',
    fontWeight: '700',
  },
  menuButton: {
    marginLeft: 16,
  },
  profileButton: {
    marginRight: 16,
  },
});