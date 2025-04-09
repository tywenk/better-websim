import { and, eq } from "drizzle-orm";
import type { AppLoadContext } from "react-router";
import { friendshipTable, pendingFriendshipTable } from "../../database/schema";

export async function sendFriendRequest(
  db: AppLoadContext["db"],
  senderId: number,
  receiverId: number
) {
  // Check if a friendship already exists
  const existingFriendship = await db.query.friendshipTable.findFirst({
    where: and(
      eq(friendshipTable.user_id, senderId),
      eq(friendshipTable.friend_id, receiverId)
    ),
  });

  if (existingFriendship) {
    throw new Error("Already friends with this user");
  }

  // Check if there's already a pending request
  const existingRequest = await db.query.pendingFriendshipTable.findFirst({
    where: and(
      eq(pendingFriendshipTable.sender_id, senderId),
      eq(pendingFriendshipTable.receiver_id, receiverId)
    ),
  });

  if (existingRequest) {
    throw new Error("Friend request already sent");
  }

  // Create the pending friendship request
  return db.insert(pendingFriendshipTable).values({
    sender_id: senderId,
    receiver_id: receiverId,
  });
}

export async function acceptFriendRequest(
  db: AppLoadContext["db"],
  requestId: number,
  receiverId: number
) {
  // Find and verify the pending request
  const request = await db.query.pendingFriendshipTable.findFirst({
    where: and(
      eq(pendingFriendshipTable.id, requestId),
      eq(pendingFriendshipTable.receiver_id, receiverId)
    ),
  });

  if (!request) {
    throw new Error("Friend request not found");
  }

  // Create bidirectional friendship entries
  await db.transaction(async (tx) => {
    // Create friendship entries in both directions
    await tx.insert(friendshipTable).values([
      {
        user_id: request.sender_id,
        friend_id: request.receiver_id,
      },
      {
        user_id: request.receiver_id,
        friend_id: request.sender_id,
      },
    ]);

    // Delete the pending request
    await tx
      .delete(pendingFriendshipTable)
      .where(eq(pendingFriendshipTable.id, requestId));
  });
}

export async function rejectFriendRequest(
  db: AppLoadContext["db"],
  requestId: number,
  receiverId: number
) {
  const result = await db
    .delete(pendingFriendshipTable)
    .where(
      and(
        eq(pendingFriendshipTable.id, requestId),
        eq(pendingFriendshipTable.receiver_id, receiverId)
      )
    );

  if (!result) {
    throw new Error("Friend request not found");
  }
}

export async function removeFriendship(
  db: AppLoadContext["db"],
  userId: number,
  friendId: number
) {
  // Remove friendship entries in both directions
  await db.transaction(async (tx) => {
    await tx
      .delete(friendshipTable)
      .where(
        and(
          eq(friendshipTable.user_id, userId),
          eq(friendshipTable.friend_id, friendId)
        )
      );

    await tx
      .delete(friendshipTable)
      .where(
        and(
          eq(friendshipTable.user_id, friendId),
          eq(friendshipTable.friend_id, userId)
        )
      );
  });
}

export async function getFriends(db: AppLoadContext["db"], userId: number) {
  return db.query.friendshipTable.findMany({
    where: eq(friendshipTable.user_id, userId),
    with: {
      friend: true,
    },
  });
}

export async function getPendingReceivedRequests(
  db: AppLoadContext["db"],
  userId: number
) {
  return db.query.pendingFriendshipTable.findMany({
    where: eq(pendingFriendshipTable.receiver_id, userId),
    with: {
      sender: true,
    },
  });
}

export async function getPendingSentRequests(
  db: AppLoadContext["db"],
  userId: number
) {
  return db.query.pendingFriendshipTable.findMany({
    where: eq(pendingFriendshipTable.sender_id, userId),
    with: {
      receiver: true,
    },
  });
}

export async function checkFriendshipStatus(
  db: AppLoadContext["db"],
  userId: number,
  otherUserId: number
): Promise<"friends" | "pending_sent" | "pending_received" | "none"> {
  // Check if they are friends
  const friendship = await db.query.friendshipTable.findFirst({
    where: and(
      eq(friendshipTable.user_id, userId),
      eq(friendshipTable.friend_id, otherUserId)
    ),
  });

  if (friendship) return "friends";

  // Check for pending requests
  const sentRequest = await db.query.pendingFriendshipTable.findFirst({
    where: and(
      eq(pendingFriendshipTable.sender_id, userId),
      eq(pendingFriendshipTable.receiver_id, otherUserId)
    ),
  });

  if (sentRequest) return "pending_sent";

  const receivedRequest = await db.query.pendingFriendshipTable.findFirst({
    where: and(
      eq(pendingFriendshipTable.sender_id, otherUserId),
      eq(pendingFriendshipTable.receiver_id, userId)
    ),
  });

  if (receivedRequest) return "pending_received";

  return "none";
}
