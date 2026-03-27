import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  Search,
  ExternalLink,
  Loader2,
  FileText,
  User,
  Users,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Document {
  id: string;
  file_name: string;
  folder_category: string | null;
  storage_url: string | null;
  google_drive_url: string | null;
  uploaded_by_client: boolean;
  created_at: string;
  client_id: string;
  job_id: string | null;
  clients: {
    id: string;
    full_name: string;
    business_name: string | null;
  } | null;
}

interface Client {
  id: string;
  full_name: string;
  business_name: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const colorMap: Record<string, string> = {
    pdf: "text-red-500",
    doc: "text-blue-600",
    docx: "text-blue-600",
    xls: "text-green-600",
    xlsx: "text-green-600",
    jpg: "text-purple-500",
    jpeg: "text-purple-500",
    png: "text-purple-500",
  };
  return colorMap[ext] ?? "text-gray-400";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Documents() {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");

  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ["all-documents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(`
          id, file_name, folder_category, storage_url, google_drive_url,
          uploaded_by_client, created_at, client_id, job_id,
          clients(id, full_name, business_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Document[];
    },
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["clients-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name, business_name")
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as Client[];
    },
  });

  // Unique folders from data
  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const doc of documents) {
      if (doc.folder_category) set.add(doc.folder_category);
    }
    return Array.from(set).sort();
  }, [documents]);

  const filtered = useMemo(() => {
    let list = [...documents];

    if (clientFilter !== "all") {
      list = list.filter((d) => d.client_id === clientFilter);
    }

    if (folderFilter !== "all") {
      if (folderFilter === "__uncategorised__") {
        list = list.filter((d) => !d.folder_category);
      } else {
        list = list.filter((d) => d.folder_category === folderFilter);
      }
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.file_name.toLowerCase().includes(q) ||
          (d.clients?.full_name ?? "").toLowerCase().includes(q) ||
          (d.clients?.business_name ?? "").toLowerCase().includes(q) ||
          (d.folder_category ?? "").toLowerCase().includes(q)
      );
    }

    return list;
  }, [documents, search, clientFilter, folderFilter]);

  return (
    <StaffLayout title="Documents">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search file name, client…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Client filter */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.business_name ?? c.full_name}
            </option>
          ))}
        </select>

        {/* Folder filter */}
        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Folders</option>
          {folders.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
          <option value="__uncategorised__">Uncategorised</option>
        </select>
      </div>

      {/* Summary row */}
      <div className="flex items-center gap-3 mb-4 text-sm text-gray-500">
        <span>
          Showing <span className="font-semibold text-gray-800">{filtered.length}</span> of{" "}
          <span className="font-semibold text-gray-800">{documents.length}</span> documents
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["File Name", "Client", "Folder", "Uploaded By", "Date", "Job", "Link"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <FileText
                            size={15}
                            className={`flex-shrink-0 ${getFileIcon(doc.file_name)}`}
                          />
                          <span className="font-medium text-gray-900 truncate max-w-[220px]">
                            {doc.file_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {doc.clients ? (
                          <Link
                            to={`/staff-portal/clients/${doc.client_id}`}
                            className="hover:text-green-700 transition-colors"
                          >
                            {doc.clients.business_name ?? doc.clients.full_name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        <span className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          {doc.folder_category ?? "Uncategorised"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {doc.uploaded_by_client ? (
                          <span className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                            <User size={12} />
                            Client
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                            <Users size={12} />
                            Staff
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {doc.job_id ? (
                          <Link
                            to={`/staff-portal/jobs/${doc.job_id}`}
                            className="text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            View Job
                          </Link>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {doc.google_drive_url || doc.storage_url ? (
                          <a
                            href={doc.google_drive_url ?? doc.storage_url ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                          >
                            <ExternalLink size={13} />
                            Open
                          </a>
                        ) : (
                          <span className="text-gray-300 text-xs">No link</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
