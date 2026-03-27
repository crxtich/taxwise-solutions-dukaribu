import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Phone, Users, Award, Calendar } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import ClientShowcase from "@/components/ClientShowcase";
import { useSiteSettings, useStats, useServices, useOffices } from "@/hooks/useSiteData";
import { getIcon } from "@/lib/iconMap";
import heroBg from "@/assets/hero-bg.jpg";

const Index = () => {
  const { data: settings } = useSiteSettings();
  const { data: stats } = useStats();
  const { data: services } = useServices();
  const { data: offices } = useOffices();

  const s = settings || {};

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-navy/80" />
        </div>
        <div className="container mx-auto px-4 relative z-10 py-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="inline-block bg-gold/20 text-gold px-4 py-1 rounded-full text-sm font-medium mb-6 border border-gold/30">
              {s.company_subtitle || "Certified Public Accountants"}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              {s.hero_headline || ""}
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl">
              {s.hero_subheading || ""}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/compliance-check" className="bg-gold text-navy px-6 py-3 rounded-md font-semibold text-center hover:opacity-90 transition-opacity">
                {s.hero_cta_primary || "Get a Free Compliance Check"}
              </Link>
              <Link to="/services" className="border border-primary-foreground/30 text-primary-foreground px-6 py-3 rounded-md font-semibold text-center hover:bg-primary-foreground/10 transition-colors">
                {s.hero_cta_secondary || "Our Services"}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {(stats || []).map((st, i) => (
            <AnimatedSection key={st.id} delay={i * 0.1} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gold">{st.value}</div>
              <div className="text-primary-foreground/70 text-sm mt-1">{st.label}</div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <AnimatedSection>
              <span className="text-gold font-medium text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                {s.about_section_title || ""}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {s.about_section_description || ""}
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { icon: Award, text: "Registered CPA Firm" },
                  { icon: Users, text: "Experienced Team" },
                  { icon: Calendar, text: `Est. ${s.year_established || "2019"}` },
                  { icon: MapPin, text: (offices || []).map(o => o.city).join(" & ") || "Mombasa & Kwale" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <item.icon className="h-5 w-5 text-green-brand shrink-0" />
                    {item.text}
                  </div>
                ))}
              </div>
              <Link to="/about" className="text-green-brand font-semibold hover:underline">
                Learn more about us →
              </Link>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {(offices || []).map((office, i) => (
                  <div key={office.id} className={`${i === 0 ? "bg-green-light" : "bg-gold-light"} rounded-lg p-6`}>
                    <MapPin className={`h-8 w-8 ${i === 0 ? "text-green-brand" : "text-gold-dark"} mb-3`} />
                    <h4 className="font-semibold text-foreground mb-1">{office.name}</h4>
                    <p className="text-sm text-muted-foreground">{office.address}</p>
                    <a href={`tel:${office.phone.replace(/\s/g, "")}`} className={`flex items-center gap-1 text-sm ${i === 0 ? "text-green-brand" : "text-gold-dark"} mt-2`}>
                      <Phone className="h-3 w-3" /> {office.phone}
                    </a>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Services preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">What We Do</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Our Services</h2>
          </AnimatedSection>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services || []).map((svc, i) => {
              const Icon = getIcon(svc.icon_name);
              return (
                <AnimatedSection key={svc.id} delay={i * 0.05}>
                  <div className="bg-card rounded-lg p-6 border border-border hover:shadow-lg hover:border-gold/30 transition-all duration-300 h-full">
                    <Icon className="h-10 w-10 text-green-brand mb-4" />
                    <h3 className="font-semibold text-lg text-foreground mb-2 font-sans">{svc.title}</h3>
                    <p className="text-sm text-muted-foreground">{svc.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
          <AnimatedSection className="text-center mt-10">
            <Link to="/services" className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-semibold inline-block hover:opacity-90 transition-opacity">
              View All Services
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Client showcase */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <ClientShowcase />
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-center">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              {s.cta_headline || ""}
            </h2>
            <p className="text-primary-foreground/60 mb-8 max-w-xl mx-auto">
              {s.cta_description || ""}
            </p>
            <Link to="/compliance-check" className="bg-gold text-navy px-8 py-3 rounded-md font-semibold inline-block hover:opacity-90 transition-opacity">
              {s.cta_button_text || "Start Your Free Check"}
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
