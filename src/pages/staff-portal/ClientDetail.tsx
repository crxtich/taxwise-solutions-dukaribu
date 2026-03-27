import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  CheckCircle2,
  Minus,
  Loader2,
  ExternalLink,
  Briefcase,
  FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  full_name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  assigned_staff_id: string | null;
  google_drive_connected: boolean;
  staff: { full_name: string } | null;
}

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  job_type: string | null;
  created_at: string;
}

interface Document {
  id: string;
  file_name: string;
  folder_category: string | null;
  storage_url: string | null;
  google_drive_url: string | null;
  uploaded_by_client: boolean;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
  on_hold: "On Hold",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PRIORITY_COLORS[priority] ?? "bg-gray-100 text-gray-600"}`}>
      {priority}
    </span>
  );
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"jobs" | "documents">("jobs");

  const { data: client, isLoading, isError } = useQuery<Client>({
    queryKey: ["client", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name, business_name, email, phone, assigned_staff_id, google_drive_connected, staff:assigned_staff_id(full_name)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Client;
    },
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["client-jobs", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, priority, due_date, job_type, created_at")
        .eq("client_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Job[];
    },
  });

  const { data: documents = [], isLoading: docsLoading } = useQuery<Document[]>({
    queryKey: ["client-documents", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, folder_category, storage_url, google_drive_url, uploaded_by_client, created_at")
        .eq("client_id", id!)
        .order("folder_category", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Document[];
    },
  });

  // Group documents by folder_category
  const groupedDocs = documents.reduce<Record<string, Document[]>>((acc, doc) => {
    const key = doc.folder_category ?? "Uncategorised";
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <StaffLayout title="Client Detail">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </StaffLayout>
    );
  }

  if (isError || !client) {
    return (
      <StaffLayout title="Client Detail">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Client not found.</p>
          <Link to="/staff-portal/clients" className="text-green-600 hover:underline text-sm">
            Back to Clients
          </Link>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title="Client Detail">
      {/* Back */}
      <button
        onClick={() => navigate("/staff-portal/clients")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Clients
      </button>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
            {client.full_name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900">{client.full_name}</h2>
            {client.business_name && (
              <p className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                <Building2 size={14} className="text-gray-400" />
                {client.business_name}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <a
                href={`mailto:${client.email}`}
                className="flex items-center gap-1.5 text-green-600 hover:text-green-800"
              >
                <Mail size={14} />
                {client.email}
              </a>
              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
                >
                  <Phone size={14} />
                  {client.phone}
                </a>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500">Assigned to:</span>
                <span className="text-xs font-medium text-gray-800">
                  {client.staff?.full_name ?? "Unassigned"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {client.google_drive_connected ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                    <CheckCircle2 size={13} />
                    Google Drive Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                    <Minus size={13} />
                    Google Drive Not Linked
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xl font-bold text-gray-900">{jobs.length}</p>
              <p className="text-xs text-gray-500">Total Jobs</p>
            </div>
            <div className="text-center px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xl font-bold text-green-700">
                {jobs.filter((j) => j.status === "completed").length}
              </p>
              <p className="text-xs text-green-600">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "jobs"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Briefcase size={15} />
          Jobs ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === "documents"
              ? "border-green-600 text-green-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText size={15} />
          Documents ({documents.length})
        </button>
      </div>

      {/* Jobs tab */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {jobsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-400">No jobs for this client.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {["Title", "Type", "Priority", "Status", "Due Date", "Created"].map((h) => (
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
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/staff-portal/jobs/${job.id}`}
                          className="font-medium text-gray-900 hover:text-green-700"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{job.job_type ?? "—"}</td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={job.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(job.due_date)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                        {formatDate(job.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Documents tab */}
      {activeTab === "documents" && (
        <div className="space-y-4">
          {docsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : Object.keys(groupedDocs).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-10 text-center text-sm text-gray-400">
              No documents for this client.
            </div>
          ) : (
            Object.entries(groupedDocs).map(([folder, docs]) => (
              <div key={folder} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {folder} ({docs.length})
                  </h3>
                </div>
                <ul className="divide-y divide-gray-50">
                  {docs.map((doc) => (
                    <li key={doc.id} className="px-4 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {doc.uploaded_by_client ? "Uploaded by client" : "Uploaded by staff"} ·{" "}
                          {formatDate(doc.created_at)}
                        </p>
                      </div>
                      {(doc.google_drive_url || doc.storage_url) && (
                        <a
                          href={doc.google_drive_url ?? doc.storage_url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap flex-shrink-0"
                        >
                          <ExternalLink size={13} />
                          Open
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </StaffLayout>
  );
}
