import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { supabase } from "@/integrations/supabase/client";
import { useSiteSettings, useJobTypes } from "@/hooks/useSiteData";

interface Job {
  id: string;
  client: string;
  type: string;
  staff: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed";
}

const STATUS_LABELS: Record<Job["status"], string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

const STATUS_COLORS: Record<Job["status"], string> = {
  pending: "bg-gold-light text-navy",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-light text-green-brand",
};

const JobTracker = () => {
  const { data: settings } = useSiteSettings();
  const { data: jobTypes } = useJobTypes();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ client: "", type: "", staff: "", deadline: "" });

  const pinCode = settings?.pin_code || "2019";
  const types = (jobTypes || []).map((t) => t.name);

  // Set default type when job types load
  useEffect(() => {
    if (types.length > 0 && !form.type) {
      setForm((f) => ({ ...f, type: types[0] }));
    }
  }, [types]);

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data.map((j: any) => ({ ...j, deadline: j.deadline })));
  };

  useEffect(() => {
    if (authenticated) fetchJobs();
  }, [authenticated]);

  const handlePin = () => {
    if (pin === pinCode) { setAuthenticated(true); setPinError(false); }
    else setPinError(true);
  };

  const addJob = async () => {
    if (!form.client || !form.staff || !form.deadline) return;
    await supabase.from("jobs").insert({ client: form.client, type: form.type, staff: form.staff, deadline: form.deadline, status: "pending" });
    setForm({ client: "", type: types[0] || "", staff: "", deadline: "" });
    setShowForm(false);
    fetchJobs();
  };

  const updateStatus = async (id: string, status: Job["status"]) => {
    await supabase.from("jobs").update({ status }).eq("id", id);
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
  };

  const deleteJob = async (id: string) => {
    await supabase.from("jobs").delete().eq("id", id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  if (!authenticated) {
    return (
      <Layout>
        <section className="py-20 bg-background min-h-[60vh] flex items-center">
          <div className="container mx-auto px-4 max-w-sm text-center">
            <h1 className="text-3xl font-bold text-foreground mb-6">Job Tracker</h1>
            <p className="text-muted-foreground mb-6 text-sm">Enter PIN to access the job tracking portal.</p>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handlePin()} placeholder="Enter PIN" maxLength={10}
              className="w-full border border-border rounded-md px-4 py-2 mb-3 text-center focus:outline-none focus:ring-2 focus:ring-primary" />
            {pinError && <p className="text-destructive text-sm mb-3">Incorrect PIN</p>}
            <button onClick={handlePin} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium w-full hover:opacity-90">Access</button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Tracker</h1>
              <p className="text-muted-foreground text-sm">{jobs.length} jobs registered</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium flex items-center gap-2 hover:opacity-90">
              <Plus className="h-4 w-4" /> New Job
            </button>
          </AnimatedSection>

          {showForm && (
            <AnimatedSection className="bg-card border border-border rounded-xl p-6 mb-8">
              <h3 className="font-bold text-foreground mb-4 font-sans">Register New Job</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <input value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} placeholder="Client Name" maxLength={100} className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                  {types.map((t) => <option key={t}>{t}</option>)}
                </select>
                <input value={form.staff} onChange={(e) => setForm({ ...form, staff: e.target.value })} placeholder="Assigned Staff" maxLength={100} className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={addJob} className="bg-gold text-navy px-4 py-2 rounded-md font-medium text-sm hover:opacity-90">Add Job</button>
                <button onClick={() => setShowForm(false)} className="text-sm text-muted-foreground hover:underline">Cancel</button>
              </div>
            </AnimatedSection>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Client</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Job Type</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Staff</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Deadline</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No jobs registered yet.</td></tr>
                  ) : jobs.map((job) => (
                    <tr key={job.id} className="border-t border-border hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium text-foreground">{job.client}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.type}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.staff}</td>
                      <td className="px-4 py-3 text-muted-foreground">{job.deadline}</td>
                      <td className="px-4 py-3">
                        <select value={job.status} onChange={(e) => updateStatus(job.id, e.target.value as Job["status"])}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${STATUS_COLORS[job.status]} cursor-pointer`}>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteJob(job.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default JobTracker;
