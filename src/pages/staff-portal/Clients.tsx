import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import StaffLayout from "@/components/staff-portal/StaffLayout";
import {
  Search,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Minus,
  Eye,
  Copy,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: string;
  full_name: string;
  business_name: string | null;
  email: string;
  phone: string | null;
  assigned_staff_id: string | null;
  google_drive_connected: boolean;
  staff: { full_name: string } | null;
}

interface StaffMember {
  id: string;
  full_name: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateTempPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOP0123456789!@#";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass;
}

// ─── Add Client Modal ─────────────────────────────────────────────────────────

interface AddClientModalProps {
  onClose: () => void;
  staffList: StaffMember[];
  onCreated: () => void;
}

function AddClientModal({ onClose, staffList, onCreated }: AddClientModalProps) {
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    assigned_staff_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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

    // 1. Create Supabase auth user
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

    // 2. Insert into clients table
    const { error: clientErr } = await supabase.from("clients").insert({
      id: authData.user.id,
      full_name: form.full_name.trim(),
      business_name: form.business_name.trim() || null,
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      assigned_staff_id: form.assigned_staff_id || null,
      google_drive_connected: false,
    });

    if (clientErr) {
      setErr(clientErr.message ?? "Failed to insert client record.");
      setSaving(false);
      return;
    }

    setSaving(false);
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

  // Success state — show temp password
  if (tempPassword) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Client Created</h2>
              <p className="text-xs text-gray-500">{form.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Share this temporary password with the client. They should change it after first login.
          </p>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 rounded-lg mb-5">
            <code className="flex-1 text-sm font-mono text-gray-800 select-all">{tempPassword}</code>
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Add New Client</h2>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                required
                placeholder="Jane Doe"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                placeholder="Acme Ltd"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              required
              placeholder="client@example.com"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+254 7XX XXX XXX"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Staff</label>
            <select
              value={form.assigned_staff_id}
              onChange={(e) => set("assigned_staff_id", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Unassigned</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
                </option>
              ))}
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
              {saving ? "Creating…" : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Clients() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [staffFilter, setStaffFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("id, full_name, business_name, email, phone, assigned_staff_id, google_drive_connected, staff:assigned_staff_id(full_name)")
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

  // Job counts per client
  const { data: jobCounts = {} } = useQuery<Record<string, number>>({
    queryKey: ["client-job-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("client_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const row of data ?? []) {
        counts[row.client_id] = (counts[row.client_id] ?? 0) + 1;
      }
      return counts;
    },
  });

  const filtered = useMemo(() => {
    let list = [...clients];
    if (staffFilter !== "all") {
      if (staffFilter === "unassigned") {
        list = list.filter((c) => !c.assigned_staff_id);
      } else {
        list = list.filter((c) => c.assigned_staff_id === staffFilter);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.full_name.toLowerCase().includes(q) ||
          (c.business_name ?? "").toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [clients, search, staffFilter]);

  return (
    <StaffLayout title="Clients">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <select
          value={staffFilter}
          onChange={(e) => setStaffFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="all">All Staff</option>
          <option value="unassigned">Unassigned</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Client
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
                  {["Client", "Business", "Email", "Phone", "Assigned Staff", "Drive", "Jobs", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                      No clients found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((client) => (
                    <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          to={`/staff-portal/clients/${client.id}`}
                          className="font-medium text-gray-900 hover:text-green-700"
                        >
                          {client.full_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{client.business_name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{client.email}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {client.phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {client.staff?.full_name ?? (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {client.google_drive_connected ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <CheckCircle2 size={14} />
                            Connected
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                            <Minus size={14} />
                            Not linked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          {jobCounts[client.id] ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/staff-portal/clients/${client.id}`}
                          className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-800 font-medium"
                        >
                          <Eye size={13} />
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

      {/* Modal */}
      {showModal && (
        <AddClientModal
          onClose={() => setShowModal(false)}
          staffList={staffList}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["client-job-counts"] });
          }}
        />
      )}
    </StaffLayout>
  );
}
