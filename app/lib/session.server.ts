import { createCookieSessionStorage, redirect } from "react-router";

function createSessionStorage(domain: string) {
  return createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: ["s3cret"],
      sameSite: "lax",
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? domain : undefined,
    },
  });
}

export const sessionStorage = createSessionStorage("localhost");

export const { commitSession, destroySession } = sessionStorage;

const getUserSession = async (request: Request) => {
  return await sessionStorage.getSession(request.headers.get("Cookie"));
};

export async function logout(request: Request, env: CloudflareEnvironment) {
  const session = await getUserSession(request);
  const storage = createSessionStorage(env.COOKIE_DOMAIN);
  return redirect("/", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
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
  remember = true,
  redirectUrl,
  env,
}: {
  request: Request;
  userId: string;
  remember: boolean;
  redirectUrl?: string;
  env: CloudflareEnvironment;
}) {
  const session = await getUserSession(request);
  session.set(USER_SESSION_KEY, userId);
  const storage = createSessionStorage(env.COOKIE_DOMAIN);
  const isProduction = process.env.NODE_ENV === "production";
  return redirect(redirectUrl || "/", {
    headers: {
      "Set-Cookie": await storage.commitSession(session, {
        domain: isProduction ? env.COOKIE_DOMAIN : undefined,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
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
