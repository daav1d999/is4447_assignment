import { db } from './client';
import { categories, habitLogs, habits, users } from './schema';

export async function seedHabitTrackerIfEmpty() {
  const existingUsers = await db.select().from(users);

  if (existingUsers.length > 0) {
    return;
  }

  const createdAt = new Date().toISOString();

  await db.insert(users).values({
    name: 'Demo User',
    email: 'demo@habittracker.com',
    passwordHash: 'demo-password-hash',
    createdAt,
  });

  const seededUsers = await db.select().from(users);
  const demoUser = seededUsers[0];

  if (!demoUser) return;

  await db.insert(categories).values([
    {
      userId: demoUser.id,
      name: 'Health',
      color: '#22C55E',
      createdAt,
    },
    {
      userId: demoUser.id,
      name: 'Study',
      color: '#3B82F6',
      createdAt,
    },
    {
      userId: demoUser.id,
      name: 'Fitness',
      color: '#F97316',
      createdAt,
    },
    {
      userId: demoUser.id,
      name: 'Mindfulness',
      color: '#8B5CF6',
      createdAt,
    },
  ]);

  const seededCategories = await db.select().from(categories);

  const healthCategory = seededCategories.find((c) => c.name === 'Health');
  const studyCategory = seededCategories.find((c) => c.name === 'Study');
  const fitnessCategory = seededCategories.find((c) => c.name === 'Fitness');
  const mindfulnessCategory = seededCategories.find((c) => c.name === 'Mindfulness');

  if (!healthCategory || !studyCategory || !fitnessCategory || !mindfulnessCategory) {
    return;
  }

  await db.insert(habits).values([
    {
      userId: demoUser.id,
      categoryId: healthCategory.id,
      name: 'Drink Water',
      description: 'Drink 8 glasses of water',
      targetType: 'weekly',
      targetValue: 7,
      logType: 'boolean',
      archived: 0,
      createdAt,
    },
    {
      userId: demoUser.id,
      categoryId: studyCategory.id,
      name: 'Study 1 Hour',
      description: 'Complete at least one focused hour of study',
      targetType: 'weekly',
      targetValue: 5,
      logType: 'boolean',
      archived: 0,
      createdAt,
    },
    {
      userId: demoUser.id,
      categoryId: fitnessCategory.id,
      name: 'Walk Steps',
      description: 'Track daily step sessions',
      targetType: 'weekly',
      targetValue: 5,
      logType: 'count',
      archived: 0,
      createdAt,
    },
    {
      userId: demoUser.id,
      categoryId: mindfulnessCategory.id,
      name: 'Meditate',
      description: 'Meditate for at least 10 minutes',
      targetType: 'monthly',
      targetValue: 20,
      logType: 'boolean',
      archived: 0,
      createdAt,
    },
  ]);

  const seededHabits = await db.select().from(habits);

  const drinkWaterHabit = seededHabits.find((h) => h.name === 'Drink Water');
  const studyHabit = seededHabits.find((h) => h.name === 'Study 1 Hour');
  const walkHabit = seededHabits.find((h) => h.name === 'Walk Steps');
  const meditateHabit = seededHabits.find((h) => h.name === 'Meditate');

  if (!drinkWaterHabit || !studyHabit || !walkHabit || !meditateHabit) {
    return;
  }

  await db.insert(habitLogs).values([
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-03-12',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-03-13',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-03-14',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-03-16',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-03-10',
      value: 1,
      notes: 'Evening revision',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-03-11',
      value: 1,
      notes: 'Library session',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-03-13',
      value: 1,
      notes: 'Exam prep',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-03-12',
      value: 2,
      notes: 'Two walks completed',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-03-14',
      value: 1,
      notes: 'One long walk',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-03-16',
      value: 3,
      notes: 'Busy active day',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-03-01',
      value: 1,
      notes: 'Morning meditation',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-03-03',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-03-08',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-03-15',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
  ]);
}
