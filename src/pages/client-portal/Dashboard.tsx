import React from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  Upload,
  ListChecks,
  HardDrive,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import ClientLayout from "@/components/client-portal/ClientLayout";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? "s" : ""} ago`;
}

export default function Dashboard() {
  const { clientUser } = useClientAuth();

  // Fetch all jobs for this client
  const { data: jobs = [] } = useQuery({
    queryKey: ["client-jobs", clientUser?.id],
    enabled: !!clientUser?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("id, status")
        .eq("client_id", clientUser!.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  // Fetch document count
  const { data: docCount = 0 } = useQuery({
    queryKey: ["client-doc-count", clientUser?.id],
    enabled: !!clientUser?.id,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("client_id", clientUser!.id);
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Fetch recent activity (last 5 entries across this client's jobs)
  const { data: recentActivity = [] } = useQuery({
    queryKey: ["client-recent-activity", clientUser?.id],
    enabled: !!clientUser?.id,
    queryFn: async () => {
      // First get job IDs for this client
      const { data: jobRows, error: jobErr } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("client_id", clientUser!.id);
      if (jobErr) throw jobErr;
      if (!jobRows || jobRows.length === 0) return [];

      const jobIds = jobRows.map((j) => j.id);

      const { data: activity, error: actErr } = await supabase
        .from("job_activity")
        .select("id, job_id, action, note, created_at")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false })
        .limit(5);
      if (actErr) throw actErr;

      const jobMap = Object.fromEntries(jobRows.map((j) => [j.id, j.title]));
      return (activity ?? []).map((a) => ({
        ...a,
        job_title: jobMap[a.job_id] ?? "Unknown job",
      }));
    },
  });

  const activeJobs = jobs.filter((j) => j.status !== "completed").length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const displayName = clientUser?.business_name || clientUser?.full_name || "there";

  const stats = [
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: Briefcase,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Completed Jobs",
      value: completedJobs,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Documents",
      value: docCount,
      icon: FileText,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <ClientLayout title="Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-6 py-5 text-white mb-6">
        <p className="text-blue-100 text-sm mb-1">Good to see you</p>
        <h2 className="text-2xl font-bold">Welcome back, {displayName}</h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.iconBg}`}>
                <Icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                <p className="text-slate-500 text-sm">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-slate-500" />
            <h3 className="font-semibold text-slate-800">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">No activity yet</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 font-medium truncate">
                      {item.job_title}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{item.action}</p>
                    {item.note && (
                      <p className="text-xs text-slate-400 truncate">{item.note}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                    {timeAgo(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/client-portal/documents"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-blue-200 transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition">
                <Upload className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">Upload Document</p>
                <p className="text-xs text-slate-500">Add files to your portal</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition" />
            </Link>

            <Link
              to="/client-portal/jobs"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-blue-200 transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition">
                <ListChecks className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">View My Jobs</p>
                <p className="text-xs text-slate-500">Track job progress &amp; status</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-green-500 transition" />
            </Link>

            <Link
              to="/client-portal/drive"
              className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-blue-200 transition group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800">
                  {clientUser?.google_drive_connected
                    ? "Google Drive Connected ✓"
                    : "Connect Google Drive"}
                </p>
                <p className="text-xs text-slate-500">
                  {clientUser?.google_drive_connected
                    ? "Your documents sync automatically"
                    : "Sync documents to your Drive"}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 transition" />
            </Link>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
