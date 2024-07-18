import { InferSelectModel, relations, sql } from 'drizzle-orm'
import {
  bigint,
  bigserial,
  index,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

import { documentSnapshots, latitudeSchema, projects } from '..'
import { timestamps } from '../schemaHelpers'

export const commits = latitudeSchema.table(
  'commits',
  {
    id: bigserial('id', { mode: 'number' }).notNull().primaryKey(),
    uuid: uuid('uuid')
      .notNull()
      .unique()
      .default(sql`gen_random_uuid()`),
    title: varchar('title', { length: 256 }),
    description: text('description'),
    projectId: bigint('project_id', { mode: 'number' })
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    mergedAt: timestamp('merged_at'),
    ...timestamps(),
  },
  (table) => ({
    projectCommitOrderIdx: index('project_commit_order_idx').on(
      table.mergedAt,
      table.projectId,
    ),
  }),
)

export const commitRelations = relations(commits, ({ one, many }) => ({
  snapshots: many(documentSnapshots, { relationName: 'snapshots' }),
  project: one(projects, {
    fields: [commits.projectId],
    references: [projects.id],
  }),
}))

export type Commit = InferSelectModel<typeof commits>
