import { createCookieSessionStorage, redirect } from "react-router";

// Stub for local development
const localEnv = {
  SESSION_SECRET: "local-dev-secret",
  COOKIE_DOMAIN: "localhost",
};

// Get the environment either from Cloudflare Workers or local stub
const getEnv = async (): Promise<Cloudflare.Env> => {
  if (process.env.NODE_ENV === "development") {
    return localEnv as Cloudflare.Env;
  }
  const { env } = await import("cloudflare:workers");
  return env;
};

function createSessionStorage(env: Cloudflare.Env) {
  const isProduction = process.env.NODE_ENV === "production";
  return createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: [env.SESSION_SECRET],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: isProduction,
      domain: isProduction ? env.COOKIE_DOMAIN : undefined,
    },
  });
}

// Initialize session storage asynchronously
const sessionStoragePromise = getEnv().then((env) => createSessionStorage(env));

const getUserSession = async (request: Request) => {
  const sessionStorage = await sessionStoragePromise;
  return await sessionStorage.getSession(request.headers.get("Cookie"));
};

export async function logout(request: Request) {
  const sessionStorage = await sessionStoragePromise;
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}

const USER_SESSION_KEY = "userId";

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get(USER_SESSION_KEY);
  return userId ? Number(userId) : undefined;
}

export async function createUserSession({
  request,
  userId,
  redirectUrl,
  remember = true,
}: {
  request: Request;
  userId: string;
  redirectUrl?: string;
  remember?: boolean;
}) {
  const sessionStorage = await sessionStoragePromise;
  const session = await getUserSession(request);
  session.set(USER_SESSION_KEY, userId);
  return redirect(redirectUrl || "/", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: remember ? 60 * 60 * 24 * 7 : undefined,
      }),
    },
  });
}

export async function authorize(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}
