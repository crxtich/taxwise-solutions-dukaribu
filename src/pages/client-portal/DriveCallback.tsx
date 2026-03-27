import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${window.location.origin}/client-portal/drive/callback`;

type CallbackState = "loading" | "success" | "error";

export default function DriveCallback() {
  const navigate = useNavigate();
  const [state, setState] = useState<CallbackState>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const clientId = params.get("state");
      const oauthError = params.get("error");

      // Handle OAuth errors (e.g., user denied access)
      if (oauthError) {
        if (!cancelled) {
          setErrorMessage(
            oauthError === "access_denied"
              ? "You cancelled the Google Drive connection. Please try again if you'd like to connect."
              : `Google returned an error: ${oauthError}`
          );
          setState("error");
        }
        return;
      }

      if (!code || !clientId) {
        if (!cancelled) {
          setErrorMessage(
            "Invalid callback: missing authorisation code or client ID."
          );
          setState("error");
        }
        return;
      }

      // Get the current session token for the Edge Function call
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        if (!cancelled) {
          setErrorMessage(
            "You must be signed in to connect Google Drive. Please log in and try again."
          );
          setState("error");
        }
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth-callback`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              code,
              client_id: clientId,
              redirect_uri: REDIRECT_URI,
            }),
          }
        );

        if (!res.ok) {
          let errMsg = `Server error (${res.status})`;
          try {
            const body = await res.json();
            errMsg = body?.error || body?.message || errMsg;
          } catch {
            // ignore parse error
          }
          throw new Error(errMsg);
        }

        if (!cancelled) {
          setState("success");
          // Short delay to show success state, then redirect
          setTimeout(() => {
            navigate("/client-portal/drive", { replace: true });
          }, 1500);
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error
              ? err.message
              : "Failed to complete Google Drive connection.";
          setErrorMessage(msg);
          setState("error");
        }
      }
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        {state === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Connecting your Google Drive…
            </h2>
            <p className="text-slate-500 text-sm">
              Please wait while we set up your Taxwise folder.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-600" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Google Drive Connected!
            </h2>
            <p className="text-slate-500 text-sm">
              Your Taxwise folder has been created. Redirecting you now…
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-red-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Connection Failed
            </h2>
            <p className="text-slate-500 text-sm mb-5">{errorMessage}</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={() => navigate("/client-portal/drive")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
              >
                Try again
              </button>
              <button
                onClick={() => navigate("/client-portal/dashboard")}
                className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition"
              >
                Go to dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
