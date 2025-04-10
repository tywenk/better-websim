import bcrypt from "bcryptjs";
import { Form, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getUserByEmail } from "~/crud/user.server";
import { createUserSession, getUserId } from "~/lib/session.server";
import type { Route } from "./+types/_auth.login";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login to Better Websim" },
    { name: "description", content: "Login to your account." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  // Check if the user is already logged in
  const userId = await getUserId(request);
  if (userId) {
    return redirect("/");
  }
  return null;
}

export async function action({ context, request }: Route.ActionArgs) {
  let response: Response;
  try {
    const formData = await request.formData();
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // Get existing user
    const user = await getUserByEmail(context.db, email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Create a session
    response = await createUserSession({
      request,
      userId: user.id.toString(),
      remember: true,
      redirectUrl: "/",
      env: context.cloudflare.env,
    });

    if (!response) {
      throw new Error("An error occurred while creating the session");
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "An unknown error occurred" };
  }

  throw response;
}

export default function Login({ actionData }: Route.ComponentProps) {
  return (
    <div className="container flex items-center justify-center py-8">
      <div className="max-w-prose w-full">
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">Login</h1>
        <Form method="post" className="mt-6">
          <div className="flex flex-col gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                name="email"
                required
                placeholder="Enter your email"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                type="password"
                id="password"
                name="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <Button type="submit">Login</Button>
              <Button variant="link" asChild>
                <a href="/signup">Need an account? Sign up</a>
              </Button>
            </div>
            {actionData?.error ? (
              <div className="flex flex-row">
                <p className="text-destructive mt-4">{actionData?.error}</p>
              </div>
            ) : null}
          </div>
        </Form>
      </div>
    </div>
  );
}
