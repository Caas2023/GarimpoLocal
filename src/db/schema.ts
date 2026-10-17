import { pgTable, text, timestamp, varchar, integer, boolean } from 'drizzle-orm/pg-core';

export const cities = pgTable('cities', {
  id: integer('id').primaryKey(), // IBGE ID
  state: varchar('state', { length: 2 }).notNull(), // UF (SP)
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(), // for the route /[uf]/[slug]
  isActive: boolean('is_active').default(true), // if we have launched in this city
});

export const categories = pgTable('categories', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
});

export const companies = pgTable('companies', {
  id: text('id').primaryKey(), // UUID or string
  cityId: integer('city_id')
    .notNull()
    .references(() => cities.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => categories.id),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 50 }),
  website: varchar('website', { length: 255 }),
  latitude: varchar('latitude', { length: 50 }),
  longitude: varchar('longitude', { length: 50 }),
  externalPlaceId: varchar('external_place_id', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const claims = pgTable('claims', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  companyId: text('company_id')
    .notNull()
    .references(() => companies.id),
  claimerEmail: varchar('claimer_email', { length: 255 }).notNull(),
  claimerName: varchar('claimer_name', { length: 255 }).notNull(),
  claimerPhone: varchar('claimer_phone', { length: 50 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending, approved, rejected
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  /** Bcrypt hash (custo ≥ 12). Nulo para usuários OAuth futuros. */
  passwordHash: varchar('password_hash', { length: 255 }),
  name: varchar('name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
