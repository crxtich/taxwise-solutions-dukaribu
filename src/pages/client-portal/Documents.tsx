import React, { useState, useRef } from "react";
import {
  Upload,
  Folder,
  FolderOpen,
  FileText,
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import ClientLayout from "@/components/client-portal/ClientLayout";

const FOLDER_CATEGORIES = [
  "Invoices/Receipts",
  "Payroll Records",
  "Tax Returns",
  "Bank Statements",
  "Contracts",
  "Permits & Licenses",
  "Audit Reports",
  "Management Accounts",
  "Other",
] as const;

type FolderCategory = (typeof FOLDER_CATEGORIES)[number];

interface Document {
  id: string;
  file_name: string;
  file_type: string | null;
  folder_category: string;
  storage_url: string | null;
  google_drive_url: string | null;
  uploaded_by_client: boolean;
  created_at: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function uploadToGoogleDrive(
  file: File,
  folderCategory: string,
  clientId: string,
  driveFolderId: string | null
): Promise<{ fileId: string; fileUrl: string } | null> {
  try {
    const { data: tokenRow, error: tokenErr } = await supabase
      .from("client_drive_tokens")
      .select("access_token")
      .eq("client_id", clientId)
      .single();

    if (tokenErr || !tokenRow?.access_token) return null;

    const accessToken = tokenRow.access_token;

    const metadata: Record<string, unknown> = {
      name: file.name,
      mimeType: file.type || "application/octet-stream",
    };
    if (driveFolderId) {
      metadata.parents = [driveFolderId];
    }

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", file);

    const res = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    return { fileId: json.id, fileUrl: json.webViewLink };
  } catch {
    return null;
  }
}

function DocumentRow({
  doc,
  onDelete,
  isDeleting,
}: {
  doc: Document;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const openUrl = doc.storage_url || doc.google_drive_url;

  return (
    <div className="flex items-center gap-3 py-2.5 px-1 group hover:bg-slate-50 rounded-lg transition">
      <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-700 font-medium truncate">{doc.file_name}</p>
        <p className="text-xs text-slate-400">{formatDate(doc.created_at)}</p>
      </div>

      {/* Source badge */}
      {doc.uploaded_by_client ? (
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
          Uploaded by me
        </span>
      ) : (
        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 flex-shrink-0">
          From Taxwise
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
            title="Open file"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {doc.uploaded_by_client && (
          <>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onDelete(doc.id)}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Delete file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FolderSection({
  category,
  docs,
  onDelete,
  deletingId,
}: {
  category: string;
  docs: Document[];
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition"
      >
        {open ? (
          <FolderOpen className="w-5 h-5 text-amber-500 flex-shrink-0" />
        ) : (
          <Folder className="w-5 h-5 text-amber-500 flex-shrink-0" />
        )}
        <span className="font-medium text-slate-700 flex-1 text-left">{category}</span>
        <span className="text-xs text-slate-400 mr-2">
          {docs.length} {docs.length === 1 ? "file" : "files"}
        </span>
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="px-4 pb-3 border-t border-slate-50">
          {docs.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No files here yet</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {docs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  onDelete={onDelete}
                  isDeleting={deletingId === doc.id}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Documents() {
  const { clientUser } = useClientAuth();
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [folderCategory, setFolderCategory] = useState<FolderCategory>("Other");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["client-documents", clientUser?.id],
    enabled: !!clientUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, file_name, file_type, folder_category, storage_url, google_drive_url, uploaded_by_client, created_at"
        )
        .eq("client_id", clientUser!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Document[];
    },
  });

  // Group by folder_category
  const grouped = React.useMemo(() => {
    const map: Record<string, Document[]> = {};
    for (const cat of FOLDER_CATEGORIES) {
      map[cat] = [];
    }
    for (const doc of documents) {
      const key = doc.folder_category || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(doc);
    }
    // Only return categories that have docs + the selected upload category
    return map;
  }, [documents]);

  const categoriesWithDocs = FOLDER_CATEGORIES.filter(
    (cat) => grouped[cat] && grouped[cat].length > 0
  );

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      setDeletingId(docId);
      // Find the doc to get storage_path
      const doc = documents.find((d) => d.id === docId);
      if (doc?.storage_url) {
        // Extract path from storage URL and delete from storage
        try {
          const urlParts = new URL(doc.storage_url);
          const pathMatch = urlParts.pathname.match(/\/object\/public\/documents\/(.+)/);
          if (pathMatch) {
            await supabase.storage.from("documents").remove([pathMatch[1]]);
          }
        } catch {
          // Ignore storage errors, still delete DB record
        }
      }
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", docId)
        .eq("client_id", clientUser!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-documents", clientUser?.id] });
      queryClient.invalidateQueries({ queryKey: ["client-doc-count", clientUser?.id] });
      setDeletingId(null);
    },
    onError: () => {
      setDeletingId(null);
    },
  });

  async function handleUpload() {
    if (!selectedFile || !clientUser) return;
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(10);

    try {
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9._\-\s]/g, "_");
      const storagePath = `${clientUser.id}/${folderCategory}/${Date.now()}_${sanitizedName}`;

      setUploadProgress(30);

      // Upload to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .upload(storagePath, selectedFile, { upsert: false });

      if (storageError) throw storageError;

      setUploadProgress(60);

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(storagePath);
      const storageUrl = urlData.publicUrl;

      // Get auth user ID
      const {
        data: { session },
      } = await supabase.auth.getSession();

      let googleDriveFileId: string | null = null;
      let googleDriveUrl: string | null = null;

      // Upload to Google Drive if connected
      if (clientUser.google_drive_connected) {
        setUploadProgress(75);
        const driveResult = await uploadToGoogleDrive(
          selectedFile,
          folderCategory,
          clientUser.id,
          clientUser.google_drive_folder_id
        );
        if (driveResult) {
          googleDriveFileId = driveResult.fileId;
          googleDriveUrl = driveResult.fileUrl;
        }
      }

      setUploadProgress(90);

      // Insert into documents table
      const { error: insertError } = await supabase.from("documents").insert({
        client_id: clientUser.id,
        file_name: selectedFile.name,
        file_type: selectedFile.type || null,
        folder_category: folderCategory,
        storage_path: storagePath,
        storage_url: storageUrl,
        google_drive_file_id: googleDriveFileId,
        google_drive_url: googleDriveUrl,
        uploaded_by_client: true,
        uploaded_by: session?.user.id ?? null,
      });

      if (insertError) throw insertError;

      setUploadProgress(100);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      queryClient.invalidateQueries({
        queryKey: ["client-documents", clientUser.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["client-doc-count", clientUser.id],
      });

      setTimeout(() => {
        setUploadProgress(null);
        setUploadSuccess(false);
      }, 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      setUploadProgress(null);
    }
  }

  return (
    <ClientLayout title="My Documents">
      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Upload Document
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* File Input */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Select file
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={(e) => {
                setSelectedFile(e.target.files?.[0] ?? null);
                setUploadError(null);
                setUploadSuccess(false);
              }}
              className="w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 border border-slate-200 rounded-lg px-2 py-1.5 transition"
            />
          </div>

          {/* Folder Category */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Folder category
            </label>
            <select
              value={folderCategory}
              onChange={(e) => setFolderCategory(e.target.value as FolderCategory)}
              className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {FOLDER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Progress Bar */}
        {uploadProgress !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">
                {uploadProgress < 100 ? "Uploading…" : "Processing…"}
              </span>
              <span className="text-xs text-slate-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Success */}
        {uploadSuccess && (
          <div className="mt-3 flex items-center gap-2 text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            File uploaded successfully
            {clientUser?.google_drive_connected && " and synced to Google Drive"}!
          </div>
        )}

        {/* Error */}
        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-red-700 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadProgress !== null}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-medium rounded-lg transition"
        >
          {uploadProgress !== null && uploadProgress < 100 ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          Upload
        </button>
      </div>

      {/* Google Drive Sync Banner */}
      {clientUser?.google_drive_connected && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">Google Drive Connected</p>
            <p className="text-xs text-green-600">
              Uploaded files are automatically synced to your Google Drive
            </p>
          </div>
          <button
            onClick={() =>
              queryClient.invalidateQueries({
                queryKey: ["client-documents", clientUser.id],
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-100 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync now
          </button>
        </div>
      )}

      {/* Document Folders */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : categoriesWithDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Folder className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No documents yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Upload your first document above
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categoriesWithDocs.map((cat) => (
            <FolderSection
              key={cat}
              category={cat}
              docs={grouped[cat]}
              onDelete={(id) => deleteMutation.mutate(id)}
              deletingId={deletingId}
            />
          ))}
        </div>
      )}
    </ClientLayout>
  );
}
