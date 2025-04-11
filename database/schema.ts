import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// First declare tables without foreign key references
export const userTable = sqliteTable("user", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
  password_hash: text().notNull(),
  last_seen_at: text("last_seen_at")
    .notNull()
    .default("1970-01-01T00:00:00.000Z"),
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

export const gameVisitTable = sqliteTable("game_visit", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: integer()
    .notNull()
    .references(() => userTable.id),
  game_id: integer()
    .notNull()
    .references(() => gameTable.id),
  visited_at: text("visited_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
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
  prompt: text().notNull().default(""),
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

export const friendshipTable = sqliteTable("friendship", {
  id: integer().primaryKey({ autoIncrement: true }),
  user_id: integer()
    .notNull()
    .references(() => userTable.id),
  friend_id: integer()
    .notNull()
    .references(() => userTable.id),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const pendingFriendshipTable = sqliteTable("pending_friendship", {
  id: integer().primaryKey({ autoIncrement: true }),
  sender_id: integer()
    .notNull()
    .references(() => userTable.id),
  receiver_id: integer()
    .notNull()
    .references(() => userTable.id),
  created_at: text("created_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`),
});

export const tokenUsageTable = sqliteTable(
  "token_usage",
  {
    id: integer().primaryKey({ autoIncrement: true }),
    message_id: text().notNull().unique(),
    user_id: integer()
      .notNull()
      .references(() => userTable.id),
    game_iteration_id: integer().references(() => gameIterationTable.id, {
      onDelete: "set null",
    }),
    model: text().notNull(),
    input_tokens: integer().notNull(),
    output_tokens: integer().notNull(),
    created_at: text("created_at")
      .notNull()
      .default(sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => [index("token_usage_user_id_idx").on(table.user_id)]
);

// Then add foreign key references through relations
export const userRelations = relations(userTable, ({ one, many }) => ({
  games: many(gameTable),
  comments: many(commentTable),
  friends: many(friendshipTable, { relationName: "userFriends" }),
  friendOf: many(friendshipTable, { relationName: "friendOfUser" }),
  sentFriendRequests: many(pendingFriendshipTable, {
    relationName: "friendRequestSender",
  }),
  receivedFriendRequests: many(pendingFriendshipTable, {
    relationName: "friendRequestReceiver",
  }),
  gameVisits: many(gameVisitTable),
  tokenUsage: many(tokenUsageTable),
}));

export const gameRelations = relations(gameTable, ({ one, many }) => ({
  creator: one(userTable, {
    fields: [gameTable.creator_id],
    references: [userTable.id],
  }),
  iterations: many(gameIterationTable),
  comments: many(commentTable),
  visits: many(gameVisitTable),
}));

export const gameVisitRelations = relations(gameVisitTable, ({ one }) => ({
  user: one(userTable, {
    fields: [gameVisitTable.user_id],
    references: [userTable.id],
  }),
  game: one(gameTable, {
    fields: [gameVisitTable.game_id],
    references: [gameTable.id],
  }),
}));

export const gameIterationRelations = relations(
  gameIterationTable,
  ({ one, many }) => ({
    game: one(gameTable, {
      fields: [gameIterationTable.game_id],
      references: [gameTable.id],
    }),
    tokenUsage: many(tokenUsageTable),
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

export const friendshipRelations = relations(friendshipTable, ({ one }) => ({
  user: one(userTable, {
    fields: [friendshipTable.user_id],
    references: [userTable.id],
    relationName: "userFriends",
  }),
  friend: one(userTable, {
    fields: [friendshipTable.friend_id],
    references: [userTable.id],
    relationName: "friendOfUser",
  }),
}));

export const pendingFriendshipRelations = relations(
  pendingFriendshipTable,
  ({ one }) => ({
    sender: one(userTable, {
      fields: [pendingFriendshipTable.sender_id],
      references: [userTable.id],
      relationName: "friendRequestSender",
    }),
    receiver: one(userTable, {
      fields: [pendingFriendshipTable.receiver_id],
      references: [userTable.id],
      relationName: "friendRequestReceiver",
    }),
  })
);

export const tokenUsageRelations = relations(tokenUsageTable, ({ one }) => ({
  user: one(userTable, {
    fields: [tokenUsageTable.user_id],
    references: [userTable.id],
  }),
  gameIteration: one(gameIterationTable, {
    fields: [tokenUsageTable.game_iteration_id],
    references: [gameIterationTable.id],
  }),
}));

export type User = Omit<typeof userTable.$inferSelect, "password_hash">;
export type CreateUser = typeof userTable.$inferInsert;
export type Game = typeof gameTable.$inferSelect;
export type CreateGame = typeof gameTable.$inferInsert;
export type GameVisit = typeof gameVisitTable.$inferSelect;
export type CreateGameVisit = typeof gameVisitTable.$inferInsert;
export type GameIteration = typeof gameIterationTable.$inferSelect;
export type CreateGameIteration = typeof gameIterationTable.$inferInsert;
export type Comment = typeof commentTable.$inferSelect;
export type CreateComment = typeof commentTable.$inferInsert;
export type TokenUsage = typeof tokenUsageTable.$inferSelect;
export type CreateTokenUsage = typeof tokenUsageTable.$inferInsert;
