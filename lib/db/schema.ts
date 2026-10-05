import { sql } from 'drizzle-orm'
import { boolean, integer, pgSchema, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

const date = (name: string) => timestamp(name, { withTimezone: true, mode: 'date' })

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull().default(''),
  nickname: text('nickname').notNull().default(''),
  theme: text('theme').$type<'light' | 'dark'>().notNull().default('light'),
  avatarUrl: text('avatar_url'),
  createdAt: date('created_at').notNull().defaultNow(),
  updatedAt: date('updated_at').notNull().defaultNow(),
})

export const roles = pgTable('user_roles', {
  userId: uuid('user_id').primaryKey().references(() => profiles.id, { onDelete: 'cascade' }),
  isAdmin: boolean('is_admin').notNull().default(false),
  isMainAdmin: boolean('is_main_admin').notNull().default(false),
  createdAt: date('created_at').notNull().defaultNow(),
})

export const returns = pgTable('return_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  performedBy: uuid('performed_by').notNull().references(() => profiles.id),
  returnedAt: date('returned_at').notNull().defaultNow(),
  pet: integer('pet_count').notNull(),
  glass: integer('glass_count').notNull(),
  total: integer('total_count').generatedAlwaysAs(sql`pet_count + glass_count`),
})

export const entries = pgTable('collection_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  pet: integer('pet_count').notNull(),
  glass: integer('glass_count').notNull(),
  revision: integer('revision').notNull().default(0),
  createdAt: date('created_at').notNull().defaultNow(),
  returnEventId: uuid('return_event_id').references(() => returns.id),
})

export const entryRequests = pgSchema('private').table('entry_create_requests', {
  requestId: uuid('request_id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  pet: integer('pet_count').notNull(),
  glass: integer('glass_count').notNull(),
  createdAt: date('created_at').notNull().defaultNow(),
})

export const identities = pgSchema('private').table('google_identities', {
  subject: text('subject').primaryKey(),
  appUserId: uuid('app_user_id').notNull().unique().references(() => profiles.id),
  authUserId: uuid('auth_user_id').unique(),
})

// Read only these columns. OAuth tokens are never selected or sent to the UI.
export const accounts = pgSchema('neon_auth').table('account', {
  id: uuid('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: uuid('userId').notNull(),
})
