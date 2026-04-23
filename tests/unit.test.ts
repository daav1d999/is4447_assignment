//adapted from week 12 tutorial

import { db } from '../db/client';
import { seedHabitTrackerIfEmpty } from '../db/seed';

jest.mock('../db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

const mockDb = db as unknown as { select: jest.Mock; insert: jest.Mock };

describe('seedHabitTrackerIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts users, categories, habits and logs when tables are empty', async () => {
    const mockValues = jest.fn().mockResolvedValue(undefined);
    const mockFrom = jest.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 1, name: 'Demo User', email: 'demo@habittracker.com', passwordHash: 'demo-password-hash', createdAt: '' }])
      .mockResolvedValueOnce([
        { id: 1, userId: 1, name: 'Health', color: '#22C55E', createdAt: '' },
        { id: 2, userId: 1, name: 'Study', color: '#3B82F6', createdAt: '' },
        { id: 3, userId: 1, name: 'Fitness', color: '#F97316', createdAt: '' },
        { id: 4, userId: 1, name: 'Mindfulness', color: '#8B5CF6', createdAt: '' },
      ])
      .mockResolvedValueOnce([
        { id: 1, name: 'Drink Water' },
        { id: 2, name: 'Study 1 Hour' },
        { id: 3, name: 'Walk Steps' },
        { id: 4, name: 'Meditate' },
      ]);

    mockDb.select.mockReturnValue({ from: mockFrom });
    mockDb.insert.mockReturnValue({ values: mockValues });

    await seedHabitTrackerIfEmpty();

    expect(mockDb.insert).toHaveBeenCalledTimes(4);

    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Demo User', email: 'demo@habittracker.com' })
    );

    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Health' }),
        expect.objectContaining({ name: 'Study' }),
        expect.objectContaining({ name: 'Fitness' }),
        expect.objectContaining({ name: 'Mindfulness' }),
      ])
    );

    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Drink Water' }),
        expect.objectContaining({ name: 'Study 1 Hour' }),
        expect.objectContaining({ name: 'Walk Steps' }),
        expect.objectContaining({ name: 'Meditate' }),
      ])
    );

    expect(mockValues).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ habitId: 1, logDate: '2026-03-12' }),
      ])
    );
  });

  it('does nothing when users already exist', async () => {
    const mockFrom = jest.fn().mockResolvedValue([
      { id: 1, name: 'Existing User', email: 'existing@test.com', passwordHash: 'hash', createdAt: '' },
    ]);
    mockDb.select.mockReturnValue({ from: mockFrom });

    await seedHabitTrackerIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});