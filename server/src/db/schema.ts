import { pgTable, uuid, varchar, timestamp, jsonb, index } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  plan:         varchar('plan', { length: 20 }).notNull().default('free'),
  createdAt:    timestamp('created_at').notNull().defaultNow(),
})

export const refreshTokens = pgTable('refresh_tokens', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [index('refresh_tokens_user_id_idx').on(t.userId)])

export const qrCodes = pgTable('qr_codes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:      varchar('type', { length: 20 }).notNull(),
  label:     varchar('label', { length: 100 }),
  data:      jsonb('data').notNull(),
  fgColor:   varchar('fg_color', { length: 7 }),
  bgColor:   varchar('bg_color', { length: 7 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [index('qr_codes_user_id_idx').on(t.userId)])

export const dynamicQRs = pgTable('dynamic_qrs', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  shortCode:   varchar('short_code', { length: 20 }).notNull().unique(),
  redirectUrl: varchar('redirect_url', { length: 2048 }).notNull(),
  label:       varchar('label', { length: 100 }),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
}, t => [
  index('dynamic_qrs_user_id_idx').on(t.userId),
  index('dynamic_qrs_short_code_idx').on(t.shortCode),
])

export const scanLogs = pgTable('scan_logs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  qrId:      uuid('qr_id').notNull().references(() => dynamicQRs.id, { onDelete: 'cascade' }),
  scannedAt: timestamp('scanned_at').notNull().defaultNow(),
  userAgent: varchar('user_agent', { length: 512 }),
}, t => [index('scan_logs_qr_id_idx').on(t.qrId)])

export const payments = pgTable('payments', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount:    varchar('amount', { length: 10 }).notNull().default('15.00'),
  status:    varchar('status', { length: 20 }).notNull().default('pending'), // pending | confirmed | cancelled
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, t => [index('payments_user_id_idx').on(t.userId)])

export type User = typeof users.$inferSelect
export type RefreshToken = typeof refreshTokens.$inferSelect
export type QRCode = typeof qrCodes.$inferSelect
export type DynamicQR = typeof dynamicQRs.$inferSelect
export type ScanLog = typeof scanLogs.$inferSelect
export type Payment = typeof payments.$inferSelect
