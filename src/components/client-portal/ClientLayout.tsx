import React, { useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FolderOpen,
  HardDrive,
  Bell,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { useEffect } from "react";

interface ClientLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navItems = [
  { label: "Dashboard", to: "/client-portal/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", to: "/client-portal/jobs", icon: Briefcase },
  { label: "Documents", to: "/client-portal/documents", icon: FolderOpen },
  { label: "Google Drive", to: "/client-portal/drive", icon: HardDrive },
  { label: "Notifications", to: "/client-portal/notifications", icon: Bell },
];

export default function ClientLayout({ children, title }: ClientLayoutProps) {
  const { clientUser, loading, signOut } = useClientAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const mainContentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading && !clientUser) {
      navigate("/client-portal/login", { replace: true });
    }
  }, [clientUser, loading, navigate]);

  useEffect(() => {
    mainContentRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  const pageTitle =
    title ??
    navItems.find((item) => location.pathname.startsWith(item.to))?.label ??
    "Client Portal";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!clientUser) return null;

  const displayName = clientUser.business_name ?? clientUser.full_name;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 text-white flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center font-bold text-sm tracking-wide flex-shrink-0">
            TW
          </div>
          <span className="text-sm font-semibold text-slate-200 leading-tight">Client Portal</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(({ label, to, icon: Icon }) => {
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
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            {clientUser.business_name && (
              <p className="text-xs text-slate-400 truncate mt-0.5">{clientUser.full_name}</p>
            )}
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

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium truncate max-w-48">
                {displayName}
              </span>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors border border-gray-200"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main ref={mainContentRef} className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
