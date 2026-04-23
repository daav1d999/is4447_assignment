//adapted from week 12 tutorial

import { render, waitFor } from '@testing-library/react-native';
import React from 'react';
import IndexScreen from '../app/(tabs)/index';
import { AppContext } from '../app/_layout';

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('react-native-paper', () => {
  const React = require('react');
  const RN = require('react-native');

  const Button = ({ children, onPress }: any) => (
    <RN.Pressable onPress={onPress}>
      <RN.Text>{children}</RN.Text>
    </RN.Pressable>
  );

  const CardContent = ({ children }: any) => <RN.View>{children}</RN.View>;

  const Card = ({ children, onPress, style }: any) => (
    <RN.Pressable onPress={onPress} style={style}>
      <RN.View>{children}</RN.View>
    </RN.Pressable>
  );
  Card.Content = CardContent;

  const Text = ({ children, style }: any) => <RN.Text style={style}>{children}</RN.Text>;

  const Chip = ({ children, onPress }: any) => (
    <RN.Pressable onPress={onPress}>
      <RN.Text>{children}</RN.Text>
    </RN.Pressable>
  );

  const Searchbar = ({ placeholder, value, onChangeText, style }: any) => (
    <RN.TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={style}
    />
  );

  const PaperProvider = ({ children }: any) => <>{children}</>;

  const MD3LightTheme = {
    colors: {
      primary: '#0F766E',
      primaryContainer: '#CCFBF1',
      secondary: '#3B82F6',
      error: '#DC2626',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      onPrimary: '#FFFFFF',
      onSurface: '#0F172A',
      outline: '#E2E8F0',
    },
  };

  return {
    Button,
    Card,
    Chip,
    Text,
    Searchbar,
    PaperProvider,
    MD3LightTheme,
  };
});

const mockHabits = [
  {
    id: 1,
    userId: 1,
    categoryId: 1,
    name: 'Drink Water',
    description: 'Drink 8 glasses',
    targetType: 'weekly',
    targetValue: 7,
    logType: 'boolean',
    archived: 0,
    createdAt: '',
  },
  {
    id: 2,
    userId: 1,
    categoryId: 2,
    name: 'Study 1 Hour',
    description: 'Focused study',
    targetType: 'weekly',
    targetValue: 5,
    logType: 'boolean',
    archived: 0,
    createdAt: '',
  },
];

const mockCategories = [
  { id: 1, userId: 1, name: 'Health', color: '#22C55E', createdAt: '' },
  { id: 2, userId: 1, name: 'Study', color: '#3B82F6', createdAt: '' },
];

const mockHabitLogs = [
  { id: 1, habitId: 1, logDate: '2026-03-28', value: 1, notes: 'Completed', createdAt: '' },
];

const mockContext = {
  currentUser: {
    id: 1,
    name: 'Admin',
    email: 'admin@habitaware.com',
    passwordHash: 'admin1234',
    createdAt: '',
  },
  setCurrentUser: jest.fn(),
  habits: mockHabits,
  setHabits: jest.fn(),
  categories: mockCategories,
  setCategories: jest.fn(),
  habitLogs: mockHabitLogs,
  setHabitLogs: jest.fn(),
};

describe('IndexScreen', () => {
  it('renders the seeded habits and add button', async () => {
    const { getByText } = render(
      <AppContext.Provider value={mockContext}>
        <IndexScreen />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Drink Water')).toBeTruthy();
      expect(getByText('Study 1 Hour')).toBeTruthy();
      expect(getByText('Add Habit')).toBeTruthy();
    });
  });
});