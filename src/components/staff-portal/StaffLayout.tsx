import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FolderOpen,
  UserCog,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
  user_id: string;
}

interface StaffLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { label: "Dashboard", to: "/staff-portal/dashboard", icon: LayoutDashboard },
  { label: "Jobs", to: "/staff-portal/jobs", icon: Briefcase },
  { label: "Clients", to: "/staff-portal/clients", icon: Users },
  { label: "Documents", to: "/staff-portal/documents", icon: FolderOpen },
];

const adminNavItem = { label: "Staff", to: "/staff-portal/staff", icon: UserCog };

export default function StaffLayout({ children, title }: StaffLayoutProps) {
  const { staffUser, loading, signOut, isAdmin } = useStaffAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !staffUser) {
      navigate("/staff-portal/login", { replace: true });
    }
  }, [staffUser, loading, navigate]);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["staff-notifications", staffUser?.id],
    enabled: !!staffUser,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, link, is_read, created_at, user_id")
        .eq("user_id", staffUser!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const recentNotifications = notifications.slice(0, 5);

  async function markRead(notif: Notification) {
    if (!notif.is_read) {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notif.id);
      queryClient.invalidateQueries({ queryKey: ["staff-notifications", staffUser?.id] });
    }
    setNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    if (notifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  const pageTitle =
    title ??
    [...navItems, adminNavItem].find((item) => location.pathname.startsWith(item.to))?.label ??
    "Staff Portal";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!staffUser) return null;

  const allNavItems = isAdmin ? [...navItems, adminNavItem] : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm tracking-wide flex-shrink-0">
            TW
          </div>
          <span className="text-sm font-semibold text-slate-200 leading-tight">Staff Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {allNavItems.map(({ label, to, icon: Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-green-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-700 px-4 py-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-white truncate">{staffUser.full_name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-300 capitalize">
              {staffUser.role}
            </span>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between px-6 h-14">
            <h1 className="text-base font-semibold text-gray-800">{pageTitle}</h1>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((prev) => !prev)}
                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">Notifications</p>
                  </div>
                  {recentNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm text-gray-400">
                      No notifications
                    </div>
                  ) : (
                    <ul>
                      {recentNotifications.map((notif) => (
                        <li key={notif.id}>
                          <button
                            onClick={() => markRead(notif)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                              !notif.is_read ? "bg-green-50" : ""
                            }`}
                          >
                            <p
                              className={`text-sm font-medium ${
                                notif.is_read ? "text-gray-700" : "text-gray-900"
                              }`}
                            >
                              {notif.title}
                            </p>
                            {notif.body && (
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {notif.body}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.created_at).toLocaleString()}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
      </div>
    </div>
  );
}
