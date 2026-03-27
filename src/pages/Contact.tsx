import { useState } from "react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { useOffices, useServices } from "@/hooks/useSiteData";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const { data: offices } = useOffices();
  const { data: services } = useServices();
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [sending, setSending] = useState(false);

  const serviceOptions = (services || []).map((s) => s.title);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("contact_submissions").insert({
      name: form.name, email: form.email, phone: form.phone || null, service: form.service || null, message: form.message,
    });
    setSending(false);
    if (error) { toast.error("Something went wrong. Please try again."); return; }
    toast.success("Message sent! We'll get back to you shortly.");
    setForm({ name: "", email: "", phone: "", service: "", message: "" });
  };

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Contact Us</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">Have a question or need a consultation? Reach out to our team.</p>
          </AnimatedSection>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <AnimatedSection>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name *" maxLength={100}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email Address *" maxLength={255}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone Number" maxLength={20}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background" />
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background">
                  <option value="">Service of Interest</option>
                  {serviceOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Your Message *" rows={5} maxLength={1000}
                  className="w-full border border-border rounded-md px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background resize-none" />
                <button type="submit" disabled={sending}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold w-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send Message"}
                </button>
              </form>
            </AnimatedSection>

            <AnimatedSection delay={0.2} className="space-y-6">
              {(offices || []).map((office, i) => (
                <div key={office.id} className={`${i === 0 ? "bg-green-light" : "bg-gold-light"} rounded-xl p-6 border border-border`}>
                  <h3 className="font-bold text-foreground mb-4 font-sans flex items-center gap-2">
                    <MapPin className={`h-5 w-5 ${i === 0 ? "text-green-brand" : "text-gold-dark"}`} /> {office.name}
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {office.address && <li>{office.address}</li>}
                    {office.po_box && <li>{office.po_box}</li>}
                    <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {office.phone}</li>
                    <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {office.email}</li>
                  </ul>
                </div>
              ))}

              {(offices || []).find((o) => o.map_url) && (
                <div className="bg-muted rounded-xl overflow-hidden border border-border">
                  <iframe
                    title="Office Location"
                    src={(offices || []).find((o) => o.map_url)?.map_url || ""}
                    width="100%" height="200" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
