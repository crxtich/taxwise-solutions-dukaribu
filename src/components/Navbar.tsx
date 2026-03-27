import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useOffices } from "@/hooks/useSiteData";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/compliance-check", label: "Compliance Check" },
  { to: "/training", label: "Training" },
  { to: "/documents", label: "Documents" },
  { to: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { data: offices } = useOffices();
  const primaryPhone = offices?.[0]?.phone || "0720 614530";

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Taxwise Solutions" className="h-12 w-auto" />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === l.to ? "text-green-brand bg-green-light" : "text-foreground/70 hover:text-foreground hover:bg-muted"
              }`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <a href={`tel:${primaryPhone.replace(/\s/g, "")}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Phone className="h-4 w-4" /> {primaryPhone}
          </a>
          <Link to="/compliance-check" className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity">
            Free Compliance Check
          </Link>
        </div>

        <button className="lg:hidden p-2" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border bg-background px-4 pb-4">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === l.to ? "text-green-brand bg-green-light" : "text-foreground/70"
              }`}>
              {l.label}
            </Link>
          ))}
          <Link to="/compliance-check" onClick={() => setOpen(false)}
            className="block mt-3 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium text-center">
            Free Compliance Check
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
