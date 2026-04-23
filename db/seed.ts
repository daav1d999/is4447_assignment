import { db } from './client';
import { categories, habitLogs, habits, users } from './schema';

export async function seedHabitTrackerIfEmpty() {
  const existingUsers = await db.select().from(users);

  if (existingUsers.length > 0) {
    return;
  }

  const now = new Date();

  const isoDaysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString();
  };

  const createdAt = now.toISOString();

  await db.insert(users).values({
    name: 'Admin',
    email: 'admin@habitaware.com',
    passwordHash: 'admin1234',
    createdAt,
  });

  const seededUsers = await db.select().from(users);
  const adminUser = seededUsers[0];

  if (!adminUser) return;

  await db.insert(categories).values([
    {
      userId: adminUser.id,
      name: 'Health',
      color: '#22C55E',
      createdAt,
    },
    {
      userId: adminUser.id,
      name: 'Study',
      color: '#3B82F6',
      createdAt,
    },
    {
      userId: adminUser.id,
      name: 'Fitness',
      color: '#F97316',
      createdAt,
    },
    {
      userId: adminUser.id,
      name: 'Mindfulness',
      color: '#8B5CF6',
      createdAt,
    },
    {
      userId: adminUser.id,
      name: 'Productivity',
      color: '#14B8A6',
      createdAt,
    },
    {
      userId: adminUser.id,
      name: 'Reading',
      color: '#EC4899',
      createdAt,
    },
  ]);

  const seededCategories = await db.select().from(categories);

  const healthCategory = seededCategories.find((c) => c.name === 'Health');
  const studyCategory = seededCategories.find((c) => c.name === 'Study');
  const fitnessCategory = seededCategories.find((c) => c.name === 'Fitness');
  const mindfulnessCategory = seededCategories.find((c) => c.name === 'Mindfulness');
  const productivityCategory = seededCategories.find((c) => c.name === 'Productivity');
  const readingCategory = seededCategories.find((c) => c.name === 'Reading');

  if (
    !healthCategory ||
    !studyCategory ||
    !fitnessCategory ||
    !mindfulnessCategory ||
    !productivityCategory ||
    !readingCategory
  ) {
    return;
  }

  await db.insert(habits).values([
    {
      userId: adminUser.id,
      categoryId: healthCategory.id,
      name: 'Drink Water',
      description: 'Drink 8 glasses of water',
      targetType: 'weekly',
      targetValue: 7,
      logType: 'boolean',
      archived: 0,
      createdAt: isoDaysAgo(3),
    },
    {
      userId: adminUser.id,
      categoryId: studyCategory.id,
      name: 'Study 1 Hour',
      description: 'Complete at least one focused hour of study',
      targetType: 'weekly',
      targetValue: 5,
      logType: 'boolean',
      archived: 0,
      createdAt: isoDaysAgo(8),
    },
    {
      userId: adminUser.id,
      categoryId: fitnessCategory.id,
      name: 'Walk Steps',
      description: 'Track daily walking sessions',
      targetType: 'weekly',
      targetValue: 5,
      logType: 'count',
      archived: 0,
      createdAt: isoDaysAgo(15),
    },
    {
      userId: adminUser.id,
      categoryId: mindfulnessCategory.id,
      name: 'Meditate',
      description: 'Meditate for at least 10 minutes',
      targetType: 'monthly',
      targetValue: 20,
      logType: 'boolean',
      archived: 0,
      createdAt: isoDaysAgo(35),
    },
    {
      userId: adminUser.id,
      categoryId: productivityCategory.id,
      name: 'Deep Work Session',
      description: 'Complete focused work blocks',
      targetType: 'weekly',
      targetValue: 4,
      logType: 'count',
      archived: 0,
      createdAt: isoDaysAgo(20),
    },
    {
      userId: adminUser.id,
      categoryId: readingCategory.id,
      name: 'Read 20 Pages',
      description: 'Read at least 20 pages',
      targetType: 'weekly',
      targetValue: 4,
      logType: 'boolean',
      archived: 0,
      createdAt: isoDaysAgo(28),
    },
  ]);

  const seededHabits = await db.select().from(habits);

  const drinkWaterHabit = seededHabits.find((h) => h.name === 'Drink Water');
  const studyHabit = seededHabits.find((h) => h.name === 'Study 1 Hour');
  const walkHabit = seededHabits.find((h) => h.name === 'Walk Steps');
  const meditateHabit = seededHabits.find((h) => h.name === 'Meditate');
  const deepWorkHabit = seededHabits.find((h) => h.name === 'Deep Work Session');
  const readingHabit = seededHabits.find((h) => h.name === 'Read 20 Pages');

  if (
    !drinkWaterHabit ||
    !studyHabit ||
    !walkHabit ||
    !meditateHabit ||
    !deepWorkHabit ||
    !readingHabit
  ) {
    return;
  }

  await db.insert(habitLogs).values([
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-03-28',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-03-30',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-01',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-03',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-07',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-10',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-14',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-17',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-20',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: drinkWaterHabit.id,
      logDate: '2026-04-22',
      value: 1,
      notes: 'Completed',
      createdAt,
    },

    {
      habitId: studyHabit.id,
      logDate: '2026-03-29',
      value: 1,
      notes: 'Library session',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-02',
      value: 1,
      notes: 'Lecture review',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-05',
      value: 1,
      notes: 'Exam prep',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-09',
      value: 1,
      notes: 'Practice questions',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-12',
      value: 1,
      notes: 'Group study',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-16',
      value: 1,
      notes: 'Revision',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-19',
      value: 1,
      notes: 'Assignments',
      createdAt,
    },
    {
      habitId: studyHabit.id,
      logDate: '2026-04-22',
      value: 1,
      notes: 'Notes cleanup',
      createdAt,
    },

    {
      habitId: walkHabit.id,
      logDate: '2026-03-30',
      value: 2,
      notes: 'Two walks completed',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-02',
      value: 1,
      notes: 'Evening walk',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-06',
      value: 3,
      notes: 'Busy active day',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-08',
      value: 2,
      notes: 'Campus and gym walk',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-11',
      value: 1,
      notes: 'Morning walk',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-15',
      value: 4,
      notes: 'Weekend activity',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-18',
      value: 2,
      notes: 'Park walk',
      createdAt,
    },
    {
      habitId: walkHabit.id,
      logDate: '2026-04-21',
      value: 3,
      notes: 'Long walk after class',
      createdAt,
    },

    {
      habitId: meditateHabit.id,
      logDate: '2026-03-27',
      value: 1,
      notes: 'Morning meditation',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-03-31',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-02',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-04',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-07',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-09',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-11',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-14',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-17',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-20',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: meditateHabit.id,
      logDate: '2026-04-22',
      value: 1,
      notes: 'Completed',
      createdAt,
    },

    {
      habitId: deepWorkHabit.id,
      logDate: '2026-04-01',
      value: 2,
      notes: 'Two strong focus blocks',
      createdAt,
    },
    {
      habitId: deepWorkHabit.id,
      logDate: '2026-04-05',
      value: 1,
      notes: 'Project planning',
      createdAt,
    },
    {
      habitId: deepWorkHabit.id,
      logDate: '2026-04-08',
      value: 2,
      notes: 'Coding session',
      createdAt,
    },
    {
      habitId: deepWorkHabit.id,
      logDate: '2026-04-13',
      value: 1,
      notes: 'Write-up work',
      createdAt,
    },
    {
      habitId: deepWorkHabit.id,
      logDate: '2026-04-18',
      value: 2,
      notes: 'Long afternoon session',
      createdAt,
    },
    {
      habitId: deepWorkHabit.id,
      logDate: '2026-04-22',
      value: 1,
      notes: 'Final polish',
      createdAt,
    },

    {
      habitId: readingHabit.id,
      logDate: '2026-03-29',
      value: 1,
      notes: 'Read before bed',
      createdAt,
    },
    {
      habitId: readingHabit.id,
      logDate: '2026-04-03',
      value: 1,
      notes: '20 pages completed',
      createdAt,
    },
    {
      habitId: readingHabit.id,
      logDate: '2026-04-06',
      value: 1,
      notes: 'Reading streak',
      createdAt,
    },
    {
      habitId: readingHabit.id,
      logDate: '2026-04-10',
      value: 1,
      notes: 'Completed',
      createdAt,
    },
    {
      habitId: readingHabit.id,
      logDate: '2026-04-14',
      value: 1,
      notes: 'Finished chapter',
      createdAt,
    },
    {
      habitId: readingHabit.id,
      logDate: '2026-04-19',
      value: 1,
      notes: 'Weekend reading',
      createdAt,
    },
    {
      habitId: readingHabit.id,
      logDate: '2026-04-22',
      value: 1,
      notes: 'Evening session',
      createdAt,
    },
  ]);
}