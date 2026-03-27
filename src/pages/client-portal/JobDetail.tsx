import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  User,
  Tag,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import ClientLayout from "@/components/client-portal/ClientLayout";

type JobStatus = "pending" | "in_progress" | "review" | "completed" | "on_hold";
type JobPriority = "low" | "normal" | "high" | "urgent";

const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-slate-100 text-slate-700" },
  in_progress: { label: "In Progress", classes: "bg-blue-100 text-blue-700" },
  review: { label: "In Review", classes: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", classes: "bg-green-100 text-green-700" },
  on_hold: { label: "On Hold", classes: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG: Record<JobPriority, { label: string; classes: string }> = {
  low: { label: "Low", classes: "bg-slate-100 text-slate-600" },
  normal: { label: "Normal", classes: "bg-blue-50 text-blue-600" },
  high: { label: "High", classes: "bg-orange-100 text-orange-600" },
  urgent: { label: "Urgent", classes: "bg-red-100 text-red-700" },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { clientUser } = useClientAuth();
  const navigate = useNavigate();

  const {
    data: job,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["client-job-detail", id, clientUser?.id],
    enabled: !!id && !!clientUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, description, job_type, status, priority, due_date, notes, assigned_staff_id, created_at, client_id"
        )
        .eq("id", id!)
        .eq("client_id", clientUser!.id)
        .single();
      if (error) throw error;

      let staff_name: string | undefined;
      if (data.assigned_staff_id) {
        const { data: staffRow } = await supabase
          .from("staff")
          .select("full_name")
          .eq("id", data.assigned_staff_id)
          .single();
        staff_name = staffRow?.full_name;
      }

      return { ...data, staff_name };
    },
  });

  const { data: activity = [] } = useQuery({
    queryKey: ["client-job-activity", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_activity")
        .select("id, action, note, created_at")
        .eq("job_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <ClientLayout title="Job Details">
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </ClientLayout>
    );
  }

  if (error || !job) {
    return (
      <ClientLayout title="Job Details">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-slate-600 font-medium">Job not found</p>
          <p className="text-slate-400 text-sm mt-1">
            This job does not exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate("/client-portal/jobs")}
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Back to jobs
          </button>
        </div>
      </ClientLayout>
    );
  }

  const statusCfg =
    STATUS_CONFIG[job.status as JobStatus] ?? STATUS_CONFIG["pending"];
  const priorityCfg =
    PRIORITY_CONFIG[job.priority as JobPriority] ?? PRIORITY_CONFIG["normal"];

  return (
    <ClientLayout title={job.title}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/client-portal/jobs")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header Card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-800">{job.title}</h2>
                <p className="text-slate-500 text-sm mt-0.5">{job.job_type}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.classes}`}
                  >
                    {statusCfg.label}
                  </span>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${priorityCfg.classes}`}
                  >
                    {priorityCfg.label} Priority
                  </span>
                </div>
              </div>
            </div>

            {job.description && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>
            )}

            {job.notes && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Notes</h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {job.notes}
                </p>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-5 h-5 text-slate-500" />
              <h3 className="font-semibold text-slate-800">Activity Log</h3>
              <span className="ml-auto text-xs text-slate-400">
                {activity.length} {activity.length === 1 ? "entry" : "entries"}
              </span>
            </div>

            {activity.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">
                No activity recorded yet
              </p>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100" />

                <ul className="space-y-4">
                  {activity.map((entry) => (
                    <li key={entry.id} className="flex gap-4 relative">
                      <div className="w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center flex-shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      </div>
                      <div className="flex-1 pb-2">
                        <p className="text-sm font-medium text-slate-700">
                          {entry.action}
                        </p>
                        {entry.note && (
                          <p className="text-sm text-slate-500 mt-0.5">{entry.note}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDateTime(entry.created_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-800 mb-4">Job Details</h3>
            <dl className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Tag className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">Type</dt>
                  <dd className="text-sm text-slate-700 font-medium">{job.job_type}</dd>
                </div>
              </div>

              {job.staff_name && (
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <dt className="text-xs text-slate-400">Assigned to</dt>
                    <dd className="text-sm text-slate-700 font-medium">
                      {job.staff_name}
                    </dd>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <CalendarDays className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">Due date</dt>
                  <dd className="text-sm text-slate-700 font-medium">
                    {formatDate(job.due_date)}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <dt className="text-xs text-slate-400">Created</dt>
                  <dd className="text-sm text-slate-700 font-medium">
                    {formatDate(job.created_at)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
