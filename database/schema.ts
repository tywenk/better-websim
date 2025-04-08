import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password_hash: text().notNull(),
});

export type User = typeof userTable.$inferSelect;
export type CreateUser = typeof userTable.$inferInsert;
