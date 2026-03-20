import {
  pgTable,
  serial,
  varchar,
  text,
  jsonb,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const hunts = pgTable(
  'hunts',
  {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 50 }).notNull(),
    filePath: varchar('file_path', { length: 255 }).notNull().unique(),
    tags: jsonb('tags').notNull().$type<string[]>().default([]),
    steps: text('steps').notNull(),
    assertions: text('assertions').notNull(),
    content: text('content').notNull(),
    stepCount: integer('step_count').notNull().default(0),
    assertionCount: integer('assertion_count').notNull().default(0),
    isVerified: boolean('is_verified').notNull().default(true),
    isFeatured: boolean('is_featured').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_hunts_category').on(table.category),
    index('idx_hunts_is_featured').on(table.isFeatured).where(sql`is_featured = true`),
    index('idx_hunts_tags').using('gin', table.tags),
    index('idx_hunts_search').using(
      'gin',
      sql`to_tsvector('english', coalesce(${table.title}, '') || ' ' || coalesce(${table.description}, '') || ' ' || coalesce(${table.name}, ''))`
    ),
  ]
);

export type Hunt = typeof hunts.$inferSelect;
export type NewHunt = typeof hunts.$inferInsert;
