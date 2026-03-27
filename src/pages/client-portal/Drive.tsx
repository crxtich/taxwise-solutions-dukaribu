import React, { useState } from "react";
import {
  HardDrive,
  CheckCircle2,
  FolderOpen,
  ExternalLink,
  Unlink,
  Loader2,
  RefreshCw,
  Shield,
  Cloud,
  FolderSync,
  Globe,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import ClientLayout from "@/components/client-portal/ClientLayout";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI =
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${window.location.origin}/client-portal/drive/callback`;

const DRIVE_SUBFOLDERS = [
  "Invoices/Receipts",
  "Payroll Records",
  "Tax Returns",
  "Bank Statements",
  "Contracts",
  "Permits & Licenses",
  "Audit Reports",
  "Management Accounts",
  "Other",
];

const FEATURES = [
  {
    icon: FolderSync,
    title: "Auto-sync uploads",
    description: "Every document you upload is automatically copied to your Drive",
  },
  {
    icon: FolderOpen,
    title: "Organised subfolders",
    description: "Files are sorted into labelled folders automatically",
  },
  {
    icon: Globe,
    title: "Access anywhere",
    description: "View your documents from any device via Google Drive",
  },
  {
    icon: Shield,
    title: "Always backed up",
    description: "Your files are safely stored in Google's infrastructure",
  },
];

export default function Drive() {
  const { clientUser } = useClientAuth();
  const queryClient = useQueryClient();
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      if (!clientUser) throw new Error("No client");

      // Delete token row
      await supabase
        .from("client_drive_tokens")
        .delete()
        .eq("client_id", clientUser.id);

      // Update clients table
      const { error } = await supabase
        .from("clients")
        .update({
          google_drive_connected: false,
          google_drive_folder_id: null,
        })
        .eq("id", clientUser.id);

      if (error) throw error;
    },
    onSuccess: () => {
      setConfirmDisconnect(false);
      // Reload the page to refresh auth context state
      window.location.reload();
    },
  });

  function handleConnect() {
    if (!clientUser) return;

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent("https://www.googleapis.com/auth/drive.file")}&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `state=${clientUser.id}`;

    window.location.href = authUrl;
  }

  const isConnected = clientUser?.google_drive_connected ?? false;
  const businessName = clientUser?.business_name || clientUser?.full_name || "Client";

  return (
    <ClientLayout title="Google Drive">
      {isConnected ? (
        /* ── Connected State ── */
        <div className="space-y-5">
          {/* Success Banner */}
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-base">
                Google Drive Connected
              </p>
              <p className="text-green-600 text-sm">
                Your documents are syncing automatically
              </p>
            </div>
          </div>

          {/* Folder Info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <HardDrive className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Your Taxwise Folder</p>
                <p className="text-sm text-slate-500">
                  Taxwise Solutions — {businessName}
                </p>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-600 mb-3">
              Subfolders created in your Drive:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DRIVE_SUBFOLDERS.map((folder) => (
                <li key={folder} className="flex items-center gap-2 text-sm text-slate-600">
                  <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  {folder}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://drive.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Drive
            </a>

            {confirmDisconnect ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">
                  Disconnect Google Drive?
                </span>
                <button
                  onClick={() => disconnectMutation.mutate()}
                  disabled={disconnectMutation.isPending}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition"
                >
                  {disconnectMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Unlink className="w-4 h-4" />
                  )}
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDisconnect(false)}
                  className="px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDisconnect(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition"
              >
                <Unlink className="w-4 h-4" />
                Disconnect
              </button>
            )}

            {disconnectMutation.isError && (
              <p className="text-sm text-red-600">
                Failed to disconnect. Please try again.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ── Not Connected State ── */
        <div className="max-w-xl">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                <HardDrive className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-slate-800 text-lg">
                  Connect Google Drive
                </h2>
                <p className="text-slate-500 text-sm">
                  Sync all your documents automatically
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-5">
              Connect your Google Drive to automatically sync all your documents. We'll
              create a dedicated Taxwise folder with organised subfolders for each
              document type.
            </p>

            {/* Features List */}
            <ul className="space-y-3 mb-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <li key={feature.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        {feature.title}
                      </p>
                      <p className="text-xs text-slate-500">{feature.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={handleConnect}
              disabled={!GOOGLE_CLIENT_ID}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-2.5 rounded-lg text-sm transition"
            >
              <HardDrive className="w-4 h-4" />
              Connect Google Drive
            </button>

            {!GOOGLE_CLIENT_ID && (
              <p className="text-xs text-red-500 mt-2 text-center">
                Google Client ID not configured.
              </p>
            )}
          </div>
        </div>
      )}
    </ClientLayout>
  );
}
