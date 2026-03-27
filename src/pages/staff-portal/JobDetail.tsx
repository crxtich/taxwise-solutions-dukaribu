import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  ArrowLeft,
  Clock,
  FileText,
  MessageSquare,
  Loader2,
  ExternalLink,
  Save,
  Activity,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  job_type: string | null;
  client_id: string;
  assigned_staff_id: string | null;
  notes: string | null;
  created_at: string;
  clients: {
    id: string;
    full_name: string;
    business_name: string | null;
  } | null;
  staff: {
    id: string;
    full_name: string;
  } | null;
}

interface ActivityEntry {
  id: string;
  job_id: string;
  staff_id: string | null;
  action: string;
  note: string | null;
  created_at: string;
  staff: { full_name: string } | null;
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

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "completed", label: "Completed" },
  { value: "on_hold", label: "On Hold" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  normal: "bg-blue-100 text-blue-700",
  high: "bg-amber-100 text-amber-700",
  urgent: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium capitalize ${PRIORITY_COLORS[priority] ?? "bg-gray-100 text-gray-600"}`}>
      {priority}
    </span>
  );
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { staffUser } = useStaffAuth();
  const queryClient = useQueryClient();

  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch job
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery<Job>({
    queryKey: ["job", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id, title, description, status, priority, due_date, job_type,
          client_id, assigned_staff_id, notes, created_at,
          clients(id, full_name, business_name),
          staff:assigned_staff_id(id, full_name)
        `)
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as Job;
    },
  });

  // Fetch activity log
  const { data: activity = [] } = useQuery<ActivityEntry[]>({
    queryKey: ["job-activity", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_activity")
        .select("id, job_id, staff_id, action, note, created_at, staff:staff_id(full_name)")
        .eq("job_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ActivityEntry[];
    },
  });

  // Fetch documents
  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["job-documents", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, folder_category, storage_url, google_drive_url, uploaded_by_client, created_at")
        .eq("job_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Document[];
    },
  });

  // Update status
  async function handleStatusChange(newStatus: string) {
    if (!job || !staffUser) return;
    setUpdatingStatus(true);
    try {
      await supabase.from("jobs").update({ status: newStatus }).eq("id", job.id);
      await supabase.from("job_activity").insert({
        job_id: job.id,
        staff_id: staffUser.id,
        action: `Status updated to ${newStatus.replace("_", " ")}`,
        note: null,
      });
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["job-activity", id] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } finally {
      setUpdatingStatus(false);
    }
  }

  // Add note
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim() || !job || !staffUser) return;
    setSavingNote(true);
    try {
      const updatedNotes = job.notes
        ? `${job.notes}\n\n[${new Date().toLocaleString()}] ${staffUser.full_name}: ${noteText.trim()}`
        : `[${new Date().toLocaleString()}] ${staffUser.full_name}: ${noteText.trim()}`;

      await supabase.from("jobs").update({ notes: updatedNotes }).eq("id", job.id);
      await supabase.from("job_activity").insert({
        job_id: job.id,
        staff_id: staffUser.id,
        action: "Note added",
        note: noteText.trim(),
      });

      setNoteText("");
      queryClient.invalidateQueries({ queryKey: ["job", id] });
      queryClient.invalidateQueries({ queryKey: ["job-activity", id] });
    } finally {
      setSavingNote(false);
    }
  }

  if (isLoading) {
    return (
      <StaffLayout title="Job Detail">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </StaffLayout>
    );
  }

  if (isError || !job) {
    return (
      <StaffLayout title="Job Detail">
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">Job not found.</p>
          <Link to="/staff-portal/jobs" className="text-green-600 hover:underline text-sm">
            Back to Jobs
          </Link>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title="Job Detail">
      {/* Back button */}
      <button
        onClick={() => navigate("/staff-portal/jobs")}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left column: main info */}
        <div className="xl:col-span-2 space-y-6">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h2>
                <Link
                  to={`/staff-portal/clients/${job.client_id}`}
                  className="text-sm text-green-600 hover:underline"
                >
                  {job.clients?.business_name ?? job.clients?.full_name ?? "—"}
                </Link>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <PriorityBadge priority={job.priority} />
                <StatusBadge status={job.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Type</p>
                <p className="text-gray-800">{job.job_type ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Assigned To</p>
                <p className="text-gray-800">{job.staff?.full_name ?? "Unassigned"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Due Date</p>
                <p className="text-gray-800">{formatDate(job.due_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-0.5">Created</p>
                <p className="text-gray-800">{formatDate(job.created_at)}</p>
              </div>
            </div>

            {job.description && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-1">Description</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.description}</p>
              </div>
            )}
          </div>

          {/* Status update */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              Update Status
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                defaultValue={job.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updatingStatus}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
              {updatingStatus && <Loader2 size={16} className="animate-spin text-gray-400" />}
              <span className="text-xs text-gray-400">Changes are saved immediately.</span>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MessageSquare size={16} className="text-gray-400" />
              Add Note
            </h3>
            <form onSubmit={handleAddNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
                placeholder="Add a note about this job…"
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <button
                type="submit"
                disabled={savingNote || !noteText.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {savingNote && <Loader2 size={14} className="animate-spin" />}
                <Save size={14} />
                {savingNote ? "Saving…" : "Save Note"}
              </button>
            </form>

            {job.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-2">All Notes</p>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto font-sans">
                  {job.notes}
                </pre>
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-gray-400" />
              Documents ({documents.length})
            </h3>
            {documents.length === 0 ? (
              <p className="text-sm text-gray-400">No documents attached to this job.</p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 border border-gray-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.file_name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {doc.folder_category ?? "Uncategorised"} ·{" "}
                        {doc.uploaded_by_client ? "Client upload" : "Staff upload"} ·{" "}
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                    {(doc.storage_url || doc.google_drive_url) && (
                      <a
                        href={doc.google_drive_url ?? doc.storage_url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-3 flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium whitespace-nowrap"
                      >
                        <ExternalLink size={13} />
                        Open
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right column: activity log */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-gray-400" />
              Activity Log
            </h3>
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity recorded yet.</p>
            ) : (
              <ul className="relative space-y-0">
                {/* vertical line */}
                <div className="absolute left-2.5 top-3 bottom-3 w-px bg-gray-200" />
                {activity.map((entry, idx) => (
                  <li key={entry.id} className="relative pl-8 pb-5 last:pb-0">
                    <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center z-10">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{entry.action}</p>
                    {entry.note && (
                      <p className="text-xs text-gray-600 mt-0.5 italic">"{entry.note}"</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      {entry.staff?.full_name ?? "System"} · {formatDateTime(entry.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
