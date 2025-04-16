import { useEffect, useState } from "react";
import { IFRAME_ELEMENT_ID } from "~/lib/constants";

function useIframeLogs(gameId?: string | null, iterationId?: string | null) {
  const [logs, setLogs] = useState<string[]>([]);

  // Only proceed if we have valid IDs
  const iframeSelector =
    gameId && iterationId
      ? `#${gameId}-${iterationId}-${IFRAME_ELEMENT_ID}`
      : null;

  // Reset logs when gameId or iterationId changes
  useEffect(() => {
    setLogs([]);
  }, [gameId, iterationId]);

  useEffect(() => {
    // If we don't have a valid selector, don't set up the listeners
    if (!iframeSelector) {
      return;
    }

    // Function to handle messages from the iframe
    const handleMessage = (event: MessageEvent) => {
      const data = event.data;

      // Check if this is a console message from our iframe
      if (
        "type" in data &&
        data.type &&
        ["log", "warn", "error", "info", "debug"].includes(data.type)
      ) {
        // Convert args to string representation
        const message = data.args
          .map((arg: any) => {
            if (typeof arg === "string") return arg;
            if (arg instanceof Error) return arg.message;
            try {
              return JSON.stringify(arg);
            } catch (e) {
              return String(arg);
            }
          })
          .join(" ");

        // Add to logs with the appropriate prefix based on the message type
        const prefix = data.type.toUpperCase();
        setLogs((prevLogs) => [...prevLogs, `[${prefix}] ${message}`]);
      }
    };

    // Add event listener for messages
    window.addEventListener("message", handleMessage);

    // Get the iframe element
    const iframe = document.getElementById(
      `${gameId}-${iterationId}-${IFRAME_ELEMENT_ID}`
    ) as HTMLIFrameElement;

    if (!iframe) {
      console.warn(
        "Iframe not found with ID:",
        `${gameId}-${iterationId}-${IFRAME_ELEMENT_ID}`
      );
      return;
    }

    // Since we can't access the iframe's document directly due to cross-origin restrictions,
    // we'll modify the srcDoc content to include our console override script
    const originalSrcDoc = iframe.getAttribute("srcDoc") || "";

    // Create a script that will override console methods
    const consoleOverrideScript = `
      <script>
        // Check if console override has already been applied
        if (window._consoleOverrideApplied) {
          console.log("Console override already applied");
        } else {
          // Mark that we've applied the console override
          window._consoleOverrideApplied = true;
          
          // Store original console methods
          const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            info: console.info,
            debug: console.debug
          };
          
          // Override console methods
          console.log = (...args) => {
            window.parent.postMessage({ type: 'log', args: args }, '*');
            originalConsole.log(...args);
          };
          
          console.warn = (...args) => {
            window.parent.postMessage({ type: 'warn', args: args }, '*');
            originalConsole.warn(...args);
          };
          
          console.error = (...args) => {
            window.parent.postMessage({ type: 'error', args: args }, '*');
            originalConsole.error(...args);
          };
          
          console.info = (...args) => {
            window.parent.postMessage({ type: 'info', args: args }, '*');
            originalConsole.info(...args);
          };
          
          console.debug = (...args) => {
            window.parent.postMessage({ type: 'debug', args: args }, '*');
            originalConsole.debug(...args);
          };
        }
      </script>
    `;

    // Insert our script at the beginning of the body
    const updatedSrcDoc = originalSrcDoc.replace(
      /<body[^>]*>/i,
      (match) => `${match}${consoleOverrideScript}`
    );

    // If there's no body tag, append the script to the end
    if (updatedSrcDoc === originalSrcDoc) {
      iframe.setAttribute(
        "srcDoc",
        `${originalSrcDoc}${consoleOverrideScript}`
      );
    } else {
      iframe.setAttribute("srcDoc", updatedSrcDoc);
    }

    console.log("Console override script added to iframe content");

    // Cleanup function
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [iframeSelector, gameId, iterationId]); // Re-run if selector or IDs change

  // Return the logs
  return logs;
}

export default useIframeLogs;
