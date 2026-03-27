import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  CalendarDays,
  User,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import ClientLayout from "@/components/client-portal/ClientLayout";

type JobStatus = "pending" | "in_progress" | "review" | "completed" | "on_hold";
type JobPriority = "low" | "normal" | "high" | "urgent";

interface Job {
  id: string;
  title: string;
  job_type: string;
  status: JobStatus;
  priority: JobPriority;
  due_date: string | null;
  assigned_staff_id: string | null;
  staff_name?: string;
}

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

type FilterTab = "all" | "active" | "completed";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Jobs() {
  const { clientUser } = useClientAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["client-jobs-full", clientUser?.id],
    enabled: !!clientUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(
          "id, title, job_type, status, priority, due_date, assigned_staff_id"
        )
        .eq("client_id", clientUser!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      const jobRows = (data ?? []) as Omit<Job, "staff_name">[];

      // Collect unique staff IDs
      const staffIds = [
        ...new Set(jobRows.map((j) => j.assigned_staff_id).filter(Boolean)),
      ] as string[];

      let staffMap: Record<string, string> = {};
      if (staffIds.length > 0) {
        const { data: staffData } = await supabase
          .from("staff")
          .select("id, full_name")
          .in("id", staffIds);
        staffMap = Object.fromEntries(
          (staffData ?? []).map((s) => [s.id, s.full_name])
        );
      }

      return jobRows.map((j) => ({
        ...j,
        staff_name: j.assigned_staff_id
          ? (staffMap[j.assigned_staff_id] ?? "Assigned")
          : undefined,
      })) as Job[];
    },
  });

  const filtered = jobs.filter((j) => {
    if (activeTab === "active") return j.status !== "completed";
    if (activeTab === "completed") return j.status === "completed";
    return true;
  });

  return (
    <ClientLayout title="My Jobs">
      {/* Filter Tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.key === "all" && (
              <span className="ml-1.5 text-xs text-slate-400">({jobs.length})</span>
            )}
            {tab.key === "active" && (
              <span className="ml-1.5 text-xs text-slate-400">
                ({jobs.filter((j) => j.status !== "completed").length})
              </span>
            )}
            {tab.key === "completed" && (
              <span className="ml-1.5 text-xs text-slate-400">
                ({jobs.filter((j) => j.status === "completed").length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No jobs found</p>
          <p className="text-slate-400 text-sm mt-1">
            {activeTab === "all"
              ? "You have no jobs yet."
              : `No ${activeTab} jobs.`}
          </p>
        </div>
      )}

      {/* Job Cards */}
      {!isLoading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((job) => {
            const statusCfg =
              STATUS_CONFIG[job.status] ?? STATUS_CONFIG["pending"];
            const priorityCfg =
              PRIORITY_CONFIG[job.priority] ?? PRIORITY_CONFIG["normal"];

            return (
              <div
                key={job.id}
                onClick={() => navigate(`/client-portal/jobs/${job.id}`)}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 cursor-pointer hover:border-blue-200 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">{job.job_type}</p>

                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusCfg.classes}`}
                        >
                          {statusCfg.label}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityCfg.classes}`}
                        >
                          {priorityCfg.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mt-2.5">
                        {job.staff_name && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <User className="w-3.5 h-3.5" />
                            {job.staff_name}
                          </span>
                        )}
                        {job.due_date && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Due {formatDate(job.due_date)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition flex-shrink-0 mt-2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ClientLayout>
  );
}
