import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userTable = sqliteTable("user", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password_hash: text().notNull(),
});

export const gameTable = sqliteTable("game", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  creator_id: integer()
    .notNull()
    .references(() => userTable.id),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const gameIterationTable = sqliteTable("game_iteration", {
  id: integer().primaryKey({ autoIncrement: true }),
  game_id: integer()
    .notNull()
    .references(() => gameTable.id),
  created_at: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  content: text().notNull(),
});

// Define relationships
export const userRelations = relations(userTable, ({ many }) => ({
  games: many(gameTable),
}));

export const gameRelations = relations(gameTable, ({ one, many }) => ({
  creator: one(userTable, {
    fields: [gameTable.creator_id],
    references: [userTable.id],
  }),
  iterations: many(gameIterationTable),
}));

export const gameIterationRelations = relations(
  gameIterationTable,
  ({ one }) => ({
    game: one(gameTable, {
      fields: [gameIterationTable.game_id],
      references: [gameTable.id],
    }),
  })
);

export type User = Omit<typeof userTable.$inferSelect, "password_hash">;
export type CreateUser = typeof userTable.$inferInsert;
export type Game = typeof gameTable.$inferSelect;
export type CreateGame = typeof gameTable.$inferInsert;
export type GameIteration = typeof gameIterationTable.$inferSelect;
export type CreateGameIteration = typeof gameIterationTable.$inferInsert;
