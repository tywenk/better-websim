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
  play_count: integer().notNull().default(0),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

export const gameIterationTable = sqliteTable("game_iteration", {
  id: integer().primaryKey({ autoIncrement: true }),
  game_id: integer()
    .notNull()
    .references(() => gameTable.id),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
  content: text().notNull(),
});

export const commentTable = sqliteTable("comment", {
  id: integer().primaryKey({ autoIncrement: true }),
  content: text().notNull(),
  game_id: integer()
    .notNull()
    .references(() => gameTable.id),
  user_id: integer()
    .notNull()
    .references(() => userTable.id),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
});

// Define relationships
export const userRelations = relations(userTable, ({ many }) => ({
  games: many(gameTable),
  comments: many(commentTable),
}));

export const gameRelations = relations(gameTable, ({ one, many }) => ({
  creator: one(userTable, {
    fields: [gameTable.creator_id],
    references: [userTable.id],
  }),
  iterations: many(gameIterationTable),
  comments: many(commentTable),
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

export const commentRelations = relations(commentTable, ({ one }) => ({
  game: one(gameTable, {
    fields: [commentTable.game_id],
    references: [gameTable.id],
  }),
  user: one(userTable, {
    fields: [commentTable.user_id],
    references: [userTable.id],
  }),
}));

export type User = Omit<typeof userTable.$inferSelect, "password_hash">;
export type CreateUser = typeof userTable.$inferInsert;
export type Game = typeof gameTable.$inferSelect;
export type CreateGame = typeof gameTable.$inferInsert;
export type GameIteration = typeof gameIterationTable.$inferSelect;
export type CreateGameIteration = typeof gameIterationTable.$inferInsert;
export type Comment = typeof commentTable.$inferSelect;
export type CreateComment = typeof commentTable.$inferInsert;
