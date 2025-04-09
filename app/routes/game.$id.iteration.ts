import Anthropic from "@anthropic-ai/sdk";
import {
  createGameIteration,
  getGame,
  getGameIterationsByGameId,
} from "~/crud/game.server";
import { authorize } from "~/lib/session.server";
import type { Route } from "./+types/game.$id.iteration";

export async function action({ context, request, params }: Route.ActionArgs) {
  // Only allow logged in users to create iterations
  const userId = await authorize(request);
  const formData = await request.formData();
  const prompt = formData.get("content")?.toString();
  const gameId = Number(params.id);
  const game = await getGame(context.db, gameId);
  if (!game) {
    return new Response(JSON.stringify({ error: "Game not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (game.creator_id !== userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!prompt || !gameId || isNaN(gameId)) {
    return new Response(JSON.stringify({ error: "Invalid iteration data" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get the previous 5 iterations
  const previousIterations = await getGameIterationsByGameId(
    context.db,
    gameId,
    { sortBy: "created_at", direction: "desc", limit: 5 }
  );

  const previousIterationsContext = previousIterations
    .map(
      (iteration, idx) =>
        `Iteration ${idx + 1} with prompt "${iteration.prompt}": ${
          iteration.content
        }`
    )
    .join("\n");

  // Initialize Anthropic client with key from Cloudflare context
  const anthropic = new Anthropic({
    apiKey: context.cloudflare.env.ANTHROPIC_API_KEY,
  });

  // Call Anthropic API
  const message = await anthropic.messages.create({
    model: "claude-3-7-sonnet-latest",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert AI coding assistant. Only respond with the code. Do not include any other text. All the code should be returned in a single html string. Do not include code blocks ticks or anything else. Just the code.

        Take into account the following context for the game:

        ${previousIterationsContext}

        Given the previous context, generate a new iteration for the game based on the following prompt:
${prompt}`,
      },
    ],
  });

  // Use the AI response as the iteration content
  const content =
    message.content[0].type === "text" ? message.content[0].text : "";

  const newIteration = await createGameIteration(context.db, {
    content,
    game_id: gameId,
    prompt,
  });

  return { iteration: newIteration };
}
