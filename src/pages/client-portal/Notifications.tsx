import React from "react";
import {
  Bell,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BellOff,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ClientLayout from "@/components/client-portal/ClientLayout";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: React.ElementType; iconClass: string; dotClass: string }
> = {
  info: {
    Icon: Info,
    iconClass: "text-blue-500 bg-blue-50",
    dotClass: "bg-blue-500",
  },
  success: {
    Icon: CheckCircle2,
    iconClass: "text-green-500 bg-green-50",
    dotClass: "bg-green-500",
  },
  warning: {
    Icon: AlertTriangle,
    iconClass: "text-amber-500 bg-amber-50",
    dotClass: "bg-amber-500",
  },
  error: {
    Icon: XCircle,
    iconClass: "text-red-500 bg-red-50",
    dotClass: "bg-red-500",
  },
};

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
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: userId } = useQuery({
    queryKey: ["auth-user-id"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.user.id ?? null;
    },
  });

  const {
    data: notifications = [],
    isLoading,
  } = useQuery({
    queryKey: ["client-notifications", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, message, type, is_read, link, created_at")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client-notifications", userId],
      });
    },
  });

  async function handleNotificationClick(notification: Notification) {
    if (!notification.is_read) {
      await markReadMutation.mutateAsync([notification.id]);
    }
    if (notification.link) {
      // Internal links
      if (
        notification.link.startsWith("/") ||
        notification.link.startsWith(window.location.origin)
      ) {
        const path = notification.link.startsWith(window.location.origin)
          ? notification.link.slice(window.location.origin.length)
          : notification.link;
        navigate(path);
      } else {
        window.open(notification.link, "_blank", "noopener,noreferrer");
      }
    }
  }

  function handleMarkAllRead() {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);
    if (unreadIds.length > 0) {
      markReadMutation.mutate(unreadIds);
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <ClientLayout title="Notifications">
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-slate-500" />
          <span className="text-slate-600 text-sm">
            {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                {unreadCount} unread
              </span>
            )}
          </span>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markReadMutation.isPending}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline disabled:opacity-50 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <BellOff className="w-7 h-7 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No notifications yet</p>
          <p className="text-slate-400 text-sm mt-1">
            We'll notify you when something needs your attention
          </p>
        </div>
      )}

      {/* Notification List */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const typeKey = (notification.type as NotificationType) in TYPE_CONFIG
              ? (notification.type as NotificationType)
              : "info";
            const config = TYPE_CONFIG[typeKey];
            const Icon = config.Icon;

            return (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`relative flex items-start gap-4 p-4 rounded-xl border transition cursor-pointer group
                  ${
                    notification.is_read
                      ? "bg-white border-slate-100 hover:border-slate-200"
                      : "bg-blue-50/40 border-blue-100 hover:border-blue-200"
                  }
                `}
              >
                {/* Unread dot */}
                {!notification.is_read && (
                  <div
                    className={`absolute top-4 right-4 w-2 h-2 rounded-full ${config.dotClass}`}
                  />
                )}

                {/* Icon */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.iconClass}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-5">
                  <p
                    className={`text-sm font-semibold ${
                      notification.is_read ? "text-slate-700" : "text-slate-800"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-slate-400">
                      {timeAgo(notification.created_at)}
                    </span>
                    {notification.link && (
                      <span className="flex items-center gap-0.5 text-xs text-blue-500 group-hover:text-blue-700 transition">
                        <ExternalLink className="w-3 h-3" />
                        View
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ClientLayout>
  );
}
