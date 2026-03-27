import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  LayoutGrid,
  TableIcon,
  Plus,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  ChevronsUpDown,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  full_name: string;
  business_name: string | null;
}

interface StaffMember {
  id: string;
  full_name: string;
}

interface JobType {
  id: string;
  name: string;
}

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
  created_at: string;
  notes: string | null;
  clients: Client | null;
  staff: StaffMember | null;
}

type SortField = "title" | "due_date" | "status" | "priority";
type SortDir = "asc" | "desc";
type StatusKey = "pending" | "in_progress" | "review" | "completed" | "on_hold";

// ─── Constants ────────────────────────────────────────────────────────────────

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

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 };

const KANBAN_COLUMNS: { key: StatusKey; label: string; headerCls: string }[] = [
  { key: "pending", label: "Pending", headerCls: "bg-slate-100 text-slate-700 border-slate-200" },
  { key: "in_progress", label: "In Progress", headerCls: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "review", label: "Review", headerCls: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: "completed", label: "Completed", headerCls: "bg-green-100 text-green-700 border-green-200" },
  { key: "on_hold", label: "On Hold", headerCls: "bg-red-100 text-red-700 border-red-200" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function generateTempPassword() {
  return Math.random().toString(36).slice(2, 10) + "A1!";
}

// ─── New Job Modal ─────────────────────────────────────────────────────────────

interface NewJobModalProps {
  onClose: () => void;
  clients: Client[];
  staffList: StaffMember[];
  jobTypes: JobType[];
  currentStaffId: string;
  onCreated: () => void;
}

function NewJobModal({ onClose, clients, staffList, jobTypes, currentStaffId, onCreated }: NewJobModalProps) {
  const [form, setForm] = useState({
    client_id: "",
    job_type: "",
    title: "",
    description: "",
    assigned_staff_id: currentStaffId,
    priority: "normal",
    due_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.client_id || !form.title.trim()) {
      setErr("Client and Title are required.");
      return;
    }
    setSaving(true);
    setErr(null);

    const { data: jobData, error: jobErr } = await supabase
      .from("jobs")
      .insert({
        client_id: form.client_id,
        job_type: form.job_type || null,
        title: form.title.trim(),
        description: form.description.trim() || null,
        assigned_staff_id: form.assigned_staff_id || null,
        priority: form.priority,
        due_date: form.due_date || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (jobErr || !jobData) {
      setErr(jobErr?.message ?? "Failed to create job.");
      setSaving(false);
      return;
    }

    await supabase.from("job_activity").insert({
      job_id: jobData.id,
      staff_id: currentStaffId,
      action: "Job created",
      note: null,
    });

    setSaving(false);
    onCreated();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">New Job</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {err && (
            <div className="px-4 py-2.5 bg-red-50 border border-red-200 text-sm text-red-700 rounded-lg">
              {err}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={form.client_id}
              onChange={(e) => set("client_id", e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select client…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name ? `${c.business_name} (${c.full_name})` : c.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              value={form.job_type}
              onChange={(e) => set("job_type", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select type…</option>
              {jobTypes.map((jt) => (
                <option key={jt.id} value={jt.name}>
                  {jt.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              required
              placeholder="e.g. VAT Filing Q2 2025"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Optional description…"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Staff</label>
              <select
                value={form.assigned_staff_id}
                onChange={(e) => set("assigned_staff_id", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Unassigned</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold transition-colors"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving ? "Creating…" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Jobs() {
  const { staffUser } = useStaffAuth();
  const queryClient = useQueryClient();

  const [view, setView] = useState<"table" | "kanban">("table");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("due_date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showModal, setShowModal] = useState(false);

  // Queries
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          id, title, description, status, priority, due_date, job_type,
          client_id, assigned_staff_id, created_at, notes,
          clients(id, full_name, business_name),
          staff:assigned_staff_id(id, full_name)
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Job[];
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

  const { data: staffList = [] } = useQuery<StaffMember[]>({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as StaffMember[];
    },
  });

  const { data: jobTypes = [] } = useQuery<JobType[]>({
    queryKey: ["job-types"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_types")
        .select("id, name")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as JobType[];
    },
  });

  // Filtered + sorted jobs
  const filteredJobs = useMemo(() => {
    let list = [...jobs];

    if (statusFilter !== "all") {
      list = list.filter((j) => j.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          (j.clients?.full_name ?? "").toLowerCase().includes(q) ||
          (j.clients?.business_name ?? "").toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "due_date") {
        cmp = (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
      } else if (sortField === "status") {
        cmp = a.status.localeCompare(b.status);
      } else if (sortField === "priority") {
        cmp = (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [jobs, search, statusFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <ChevronsUpDown size={13} className="text-gray-400" />;
    return sortDir === "asc" ? (
      <ChevronUp size={13} className="text-green-600" />
    ) : (
      <ChevronDown size={13} className="text-green-600" />
    );
  }

  return (
    <StaffLayout title="Job Manager">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs or client…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>

        {/* View toggle */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden bg-white">
          <button
            onClick={() => setView("table")}
            className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${view === "table" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <TableIcon size={15} />
            Table
          </button>
          <button
            onClick={() => setView("kanban")}
            className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${view === "kanban" ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <LayoutGrid size={15} />
            Kanban
          </button>
        </div>

        {/* New Job */}
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Job
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      )}

      {/* Table View */}
      {!isLoading && view === "table" && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {[
                    { label: "Title", field: "title" as SortField },
                    { label: "Client", field: null },
                    { label: "Type", field: null },
                    { label: "Assigned", field: null },
                    { label: "Priority", field: "priority" as SortField },
                    { label: "Due Date", field: "due_date" as SortField },
                    { label: "Status", field: "status" as SortField },
                    { label: "Actions", field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && toggleSort(field)}
                      className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${field ? "cursor-pointer select-none hover:text-gray-700" : ""}`}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {field && <SortIcon field={field} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px]">
                        <Link
                          to={`/staff-portal/jobs/${job.id}`}
                          className="hover:text-green-700 truncate block"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {job.clients?.business_name ?? job.clients?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {job.job_type ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {job.staff?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={job.priority} />
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(job.due_date)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/staff-portal/jobs/${job.id}`}
                          className="text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {!isLoading && view === "kanban" && (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {KANBAN_COLUMNS.map(({ key, label, headerCls }) => {
              const colJobs = filteredJobs.filter((j) => j.status === key);
              return (
                <div key={key} className="w-72 flex-shrink-0">
                  <div className={`flex items-center justify-between px-3 py-2 rounded-t-xl border ${headerCls} mb-2`}>
                    <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
                    <span className="text-xs font-bold bg-white/70 px-1.5 py-0.5 rounded-full">
                      {colJobs.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {colJobs.length === 0 && (
                      <div className="px-3 py-6 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
                        No jobs
                      </div>
                    )}
                    {colJobs.map((job) => (
                      <Link
                        key={job.id}
                        to={`/staff-portal/jobs/${job.id}`}
                        className="block bg-white rounded-xl border border-gray-200 shadow-sm p-3.5 hover:shadow-md hover:border-green-300 transition-all"
                      >
                        <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{job.title}</p>
                        <p className="text-xs text-gray-500 mb-2.5 truncate">
                          {job.clients?.business_name ?? job.clients?.full_name ?? "No client"}
                        </p>
                        <div className="flex items-center justify-between">
                          <PriorityBadge priority={job.priority} />
                          <span className="text-xs text-gray-400">{formatDate(job.due_date)}</span>
                        </div>
                        {job.staff && (
                          <div className="flex items-center gap-1.5 mt-2.5">
                            <div className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {initials(job.staff.full_name)}
                            </div>
                            <span className="text-xs text-gray-500 truncate">{job.staff.full_name}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showModal && staffUser && (
        <NewJobModal
          onClose={() => setShowModal(false)}
          clients={clients}
          staffList={staffList}
          jobTypes={jobTypes}
          currentStaffId={staffUser.id}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["jobs"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-recent-jobs"] });
          }}
        />
      )}
    </StaffLayout>
  );
}
