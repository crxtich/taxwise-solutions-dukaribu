import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useStaffAuth } from "@/contexts/StaffAuthContext";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  Plus,
  X,
  Loader2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Copy,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StaffRow {
  id: string;
  full_name: string;
  email: string;
  role: "staff" | "manager" | "admin";
  is_active: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-100 text-red-700",
  manager: "bg-purple-100 text-purple-700",
  staff: "bg-blue-100 text-blue-700",
};

function generateTempPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP0123456789!@#";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// ─── Add Staff Modal ──────────────────────────────────────────────────────────

interface AddStaffModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function AddStaffModal({ onClose, onCreated }: AddStaffModalProps) {
  const [form, setForm] = useState({ full_name: "", email: "", role: "staff" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [createdEmail, setCreatedEmail] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      setErr("Full Name and Email are required.");
      return;
    }

    setSaving(true);
    setErr(null);

    const tempPass = generateTempPassword();

    // 1. Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: form.email.trim(),
      password: tempPass,
      email_confirm: true,
    });

    if (authErr || !authData?.user) {
      setErr(authErr?.message ?? "Failed to create auth user.");
      setSaving(false);
      return;
    }

    // 2. Insert into staff table
    const { error: staffErr } = await supabase.from("staff").insert({
      id: authData.user.id,
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      role: form.role as "staff" | "manager" | "admin",
      is_active: true,
    });

    if (staffErr) {
      setErr(staffErr.message ?? "Failed to insert staff record.");
      setSaving(false);
      return;
    }

    setSaving(false);
    setCreatedEmail(form.email.trim());
    setTempPassword(tempPass);
    onCreated();
  }

  function copyPassword() {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // Success dialog
  if (tempPassword) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Staff Member Created</h2>
              <p className="text-xs text-gray-500">{createdEmail}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Share this temporary password with the new staff member. They should change it after first login.
          </p>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-lg mb-5">
            <code className="flex-1 text-sm font-mono text-gray-800 select-all break-all">
              {tempPassword}
            </code>
            <button
              onClick={copyPassword}
              className="text-gray-500 hover:text-gray-800 flex-shrink-0"
              title="Copy"
            >
              <Copy size={15} />
            </button>
          </div>
          {copied && <p className="text-xs text-green-600 mb-3">Copied to clipboard!</p>}
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Add Staff Member</h2>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => set("full_name", e.target.value)}
              required
              placeholder="Jane Mwangi"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="jane@taxwise.co.ke"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
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
              {saving ? "Creating…" : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffManagement() {
  const { isAdmin, staffUser } = useStaffAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const { data: staffList = [], isLoading } = useQuery<StaffRow[]>({
    queryKey: ["all-staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff")
        .select("id, full_name, email, role, is_active")
        .order("full_name");
      if (error) throw error;
      return (data ?? []) as StaffRow[];
    },
  });

  async function toggleActive(member: StaffRow) {
    if (member.id === staffUser?.id) return; // Can't deactivate yourself
    setTogglingId(member.id);
    try {
      await supabase
        .from("staff")
        .update({ is_active: !member.is_active })
        .eq("id", member.id);
      queryClient.invalidateQueries({ queryKey: ["all-staff"] });
    } finally {
      setTogglingId(null);
    }
  }

  // Access denied
  if (!isAdmin) {
    return (
      <StaffLayout title="Staff Management">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 max-w-sm">
            You do not have permission to manage staff. Only administrators can access this page.
          </p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout title="Staff Management">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">
          {staffList.length} staff member{staffList.length !== 1 ? "s" : ""} total
        </p>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Staff
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Staff Member", "Email", "Role", "Status", "Actions"].map((h) => (
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
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  staffList.map((member) => (
                    <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${!member.is_active ? "opacity-60" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                              member.role === "admin"
                                ? "bg-red-500"
                                : member.role === "manager"
                                ? "bg-purple-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {member.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.full_name}</p>
                            {member.id === staffUser?.id && (
                              <p className="text-xs text-gray-400">(you)</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{member.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                            ROLE_COLORS[member.role] ?? "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {member.is_active ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                            <CheckCircle2 size={13} />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
                            <XCircle size={13} />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(member)}
                          disabled={togglingId === member.id || member.id === staffUser?.id}
                          title={
                            member.id === staffUser?.id
                              ? "You cannot deactivate yourself"
                              : member.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            member.is_active
                              ? "text-red-600 hover:bg-red-50 bg-red-50/50 border border-red-200"
                              : "text-green-600 hover:bg-green-50 bg-green-50/50 border border-green-200"
                          }`}
                        >
                          {togglingId === member.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : member.is_active ? (
                            <ToggleRight size={14} />
                          ) : (
                            <ToggleLeft size={14} />
                          )}
                          {member.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddStaffModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["all-staff"] });
          }}
        />
      )}
    </StaffLayout>
  );
}
