import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import { userTable } from "../../database/schema";

const SALT_ROUNDS = 10;

type NewUser = {
  name: string;
  email: string;
  password: string;
};

type UpdateUserInput = Partial<Omit<NewUser, "password">> & {
  password?: string;
};

export async function createUser(db: AppLoadContext["db"], input: NewUser) {
  const password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const [user] = await db
    .insert(userTable)
    .values({
      ...input,
      password_hash,
    })
    .returning({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
    });

  return user;
}

export async function getUserById(
  db: AppLoadContext["db"],
  id: string | number
) {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  const [user] = await db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      last_seen_at: userTable.last_seen_at,
    })
    .from(userTable)
    .where(eq(userTable.id, numericId));

  return user || null;
}

export async function getUserByEmail(db: AppLoadContext["db"], email: string) {
  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  return user || null;
}

export async function updateUser(
  db: AppLoadContext["db"],
  id: string | number,
  input: UpdateUserInput
) {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;
  const updates: Partial<typeof input & { password_hash?: string }> = {
    ...input,
  };

  if (input.password) {
    updates.password_hash = await bcrypt.hash(input.password, SALT_ROUNDS);
    delete updates.password;
  }

  const [user] = await db
    .update(userTable)
    .set(updates)
    .where(eq(userTable.id, numericId))
    .returning({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      last_seen_at: userTable.last_seen_at,
    });

  return user;
}

export async function deleteUser(
  db: AppLoadContext["db"],
  id: string | number
) {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id;

  const [user] = await db
    .delete(userTable)
    .where(eq(userTable.id, numericId))
    .returning({
      id: userTable.id,
    });

  return user || null;
}

export async function verifyPassword(
  db: AppLoadContext["db"],
  email: string,
  password: string
) {
  const user = await getUserByEmail(db, email);
  if (!user) return false;

  return bcrypt.compare(password, user.password_hash);
}

export async function updateLastSeen(db: AppLoadContext["db"], id: number) {
  const [user] = await db
    .update(userTable)
    .set({
      last_seen_at: new Date().toISOString(),
    })
    .where(eq(userTable.id, id))
    .returning({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      last_seen_at: userTable.last_seen_at,
    });

  return user;
}
