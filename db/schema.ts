import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: text('created_at').notNull(),
});

export const habits = sqliteTable('habits', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  categoryId: integer('category_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  targetType: text('target_type').notNull(),
  targetValue: integer('target_value').notNull(),
  logType: text('log_type').notNull(),
  archived: integer('archived').notNull().default(0),
  createdAt: text('created_at').notNull(),
});

export const habitLogs = sqliteTable('habit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  habitId: integer('habit_id').notNull(),
  logDate: text('log_date').notNull(),
  value: integer('value').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});
