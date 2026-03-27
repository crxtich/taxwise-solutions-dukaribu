import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  Briefcase,
  CalendarClock,
  Users,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  client_id: string;
  clients: { full_name: string; business_name: string | null } | null;
}

interface StatsData {
  activeJobs: number;
  dueThisWeek: number;
  totalClients: number;
  completedThisMonth: number;
}

type StatusKey = "pending" | "in_progress" | "review" | "completed" | "on_hold";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<StatusKey, string> = {
  pending: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-red-100 text-red-700",
};

const STATUS_BAR_COLORS: Record<StatusKey, string> = {
  pending: "bg-slate-400",
  in_progress: "bg-blue-500",
  review: "bg-amber-500",
  completed: "bg-green-500",
  on_hold: "bg-red-500",
};

const STATUS_LABELS: Record<StatusKey, string> = {
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
  const cls = STATUS_COLORS[status as StatusKey] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {STATUS_LABELS[status as StatusKey] ?? status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const cls = PRIORITY_COLORS[priority] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {priority}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const weekFromNow = new Date(today);
  weekFromNow.setDate(today.getDate() + 7);

  // Stats
  const { data: stats, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [activeRes, weekRes, clientRes, completedRes] = await Promise.all([
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .neq("status", "completed"),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .gte("due_date", today.toISOString().split("T")[0])
          .lte("due_date", weekFromNow.toISOString().split("T")[0])
          .neq("status", "completed"),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
          .gte("created_at", startOfMonth),
      ]);

      return {
        activeJobs: activeRes.count ?? 0,
        dueThisWeek: weekRes.count ?? 0,
        totalClients: clientRes.count ?? 0,
        completedThisMonth: completedRes.count ?? 0,
      };
    },
    refetchInterval: 60000,
  });

  // Recent jobs (last 5)
  const { data: recentJobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["dashboard-recent-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, title, status, priority, due_date, client_id, clients(full_name, business_name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as Job[];
    },
    refetchInterval: 60000,
  });

  // Jobs by status (for bar chart)
  const { data: allJobs = [] } = useQuery<{ status: string }[]>({
    queryKey: ["dashboard-jobs-by-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("status");
      if (error) throw error;
      return (data ?? []) as { status: string }[];
    },
    refetchInterval: 60000,
  });

  const statusCounts = (["pending", "in_progress", "review", "completed", "on_hold"] as StatusKey[]).map(
    (s) => ({ status: s, count: allJobs.filter((j) => j.status === s).length })
  );
  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);

  const statCards = [
    {
      label: "Total Active Jobs",
      value: stats?.activeJobs ?? 0,
      icon: Briefcase,
      color: "bg-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Due This Week",
      value: stats?.dueThisWeek ?? 0,
      icon: CalendarClock,
      color: "bg-amber-500",
      bg: "bg-amber-50",
    },
    {
      label: "Total Clients",
      value: stats?.totalClients ?? 0,
      icon: Users,
      color: "bg-purple-500",
      bg: "bg-purple-50",
    },
    {
      label: "Completed This Month",
      value: stats?.completedThisMonth ?? 0,
      icon: CheckCircle2,
      color: "bg-green-500",
      bg: "bg-green-50",
    },
  ];

  return (
    <StaffLayout title="Dashboard">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
            </div>
            <div>
              {statsLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">Recent Jobs</h2>
            <Link
              to="/staff-portal/jobs"
              className="text-xs text-green-600 hover:text-green-700 font-medium"
            >
              View all &rarr;
            </Link>
          </div>

          {jobsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No jobs yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Title
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Client
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Due
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3">
                        <Link
                          to={`/staff-portal/jobs/${job.id}`}
                          className="font-medium text-gray-900 hover:text-green-700 truncate block max-w-[180px]"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600 truncate max-w-[140px]">
                        {job.clients?.business_name ?? job.clients?.full_name ?? "—"}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {formatDate(job.due_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Jobs by Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Jobs by Status</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            {statusCounts.map(({ status, count }) => {
              const pct = Math.round((count / maxCount) * 100);
              const barCls = STATUS_BAR_COLORS[status as StatusKey];
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">
                      {STATUS_LABELS[status as StatusKey]}
                    </span>
                    <span className="text-xs font-semibold text-gray-800">{count}</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barCls}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {allJobs.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No job data yet.</p>
            )}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
