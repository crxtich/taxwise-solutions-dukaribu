import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { code, client_id, redirect_uri } = await req.json();

    if (!code || !client_id) {
      return new Response(JSON.stringify({ error: "Missing code or client_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: Deno.env.get("GOOGLE_CLIENT_ID") ?? "",
        client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET") ?? "",
        redirect_uri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return new Response(JSON.stringify({ error: "Token exchange failed", detail: err }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const tokens = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokens;
    const token_expiry = new Date(Date.now() + expires_in * 1000).toISOString();

    // Init Supabase admin client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch client's business name for folder naming
    const { data: clientRow } = await supabase
      .from("clients")
      .select("business_name, full_name")
      .eq("id", client_id)
      .single();

    const folderName = `Taxwise Solutions — ${clientRow?.business_name || clientRow?.full_name || "Client"}`;
    const subfolders = [
      "Invoices", "Receipts", "Payroll Records", "Tax Returns",
      "Bank Statements", "Contracts", "Permits & Licenses",
      "Audit Reports", "Management Accounts",
    ];

    // Create root folder in Google Drive
    const folderRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      }),
    });

    if (!folderRes.ok) {
      const err = await folderRes.text();
      return new Response(JSON.stringify({ error: "Failed to create Drive folder", detail: err }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rootFolder = await folderRes.json();
    const rootFolderId: string = rootFolder.id;

    // Create all subfolders
    await Promise.all(
      subfolders.map((name) =>
        fetch("https://www.googleapis.com/drive/v3/files", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [rootFolderId],
          }),
        })
      )
    );

    // Save tokens to client_drive_tokens
    await supabase.from("client_drive_tokens").upsert({
      client_id,
      access_token,
      refresh_token,
      token_expiry,
      scope: "https://www.googleapis.com/auth/drive.file",
      updated_at: new Date().toISOString(),
    }, { onConflict: "client_id" });

    // Update clients table
    await supabase
      .from("clients")
      .update({
        google_drive_folder_id: rootFolderId,
        google_drive_connected: true,
      })
      .eq("id", client_id);

    return new Response(
      JSON.stringify({ success: true, folder_id: rootFolderId, folder_name: folderName }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
