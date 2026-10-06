import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const sessions=sqliteTable('mirror_sessions',{
  id:text('id').primaryKey(),state:text('state').notNull(),version:integer('version').notNull().default(0),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),
});
export const codes=sqliteTable('mirror_codes',{
  id:text('id').primaryKey(),hash:text('hash').notNull().unique(),suffix:text('suffix').notNull(),batch:text('batch').notNull(),status:text('status').notNull().default('active'),claimedBy:text('claimed_by'),createdAt:integer('created_at').notNull(),claimedAt:integer('claimed_at'),
},t=>[index('mirror_codes_claimed_by').on(t.claimedBy)]);
export const limits=sqliteTable('mirror_limits',{
  id:text('id').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull(),
},t=>[index('mirror_limits_expiry').on(t.expiresAt)]);
