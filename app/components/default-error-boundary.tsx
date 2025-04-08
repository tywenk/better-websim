import { AlertCircle } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

export function DefaultErrorBoundary() {
  const error = useRouteError();

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        {message} {details}
        {stack && (
          <pre className="w-full p-4 overflow-x-auto">
            <code>{stack}</code>
          </pre>
        )}
      </AlertDescription>
    </Alert>
  );
}
