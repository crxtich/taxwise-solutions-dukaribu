import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useSiteSettings, useOffices } from "@/hooks/useSiteData";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const { data: offices } = useOffices();
  const s = settings || {};

  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="inline-block bg-white rounded-lg px-3 py-2 mb-4">
              <img src={logo} alt={s.company_name || "Taxwise Solutions"} className="h-10 w-auto" />
            </div>
            <p className="text-gold font-display text-lg">"{s.tagline || "Compliance. Clarity. Confidence."}"</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gold">Quick Links</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/services", label: "Services" },
                { to: "/clients", label: "Clients" },
                { to: "/compliance-check", label: "Compliance Check" },
                { to: "/training", label: "Training" },
                { to: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary-foreground transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {(offices || []).map((office, i) => (
            <div key={office.id}>
              <h4 className="font-semibold mb-4 text-gold">{office.name}</h4>
              <ul className="space-y-3 text-sm text-primary-foreground/70">
                {office.address && <li className="flex gap-2"><MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {office.address}</li>}
                <li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /> {office.phone}</li>
                <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" /> {office.email}</li>
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-primary-foreground/40">
          <p>© {new Date().getFullYear()} {s.company_name || "Taxwise Solutions"}. {s.po_box || ""}</p>
          <p className="mt-2 md:mt-0">All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
