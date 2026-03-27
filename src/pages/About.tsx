import { MapPin, Phone, Mail, Award, Users, Calendar, Target } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { useSiteSettings, useOffices } from "@/hooks/useSiteData";

const About = () => {
  const { data: settings } = useSiteSettings();
  const { data: offices } = useOffices();
  const s = settings || {};

  const highlights = [
    { icon: Award, title: "Registered Firm", desc: "Fully registered with the Registrar of Companies" },
    { icon: Calendar, title: `Est. ${s.year_established || "2019"}`, desc: `Over ${new Date().getFullYear() - Number(s.year_established || 2019)} years of trusted financial services` },
    { icon: Users, title: "Expert Team", desc: "Certified public accountants and tax specialists" },
    { icon: Target, title: "Client-Centric", desc: "Tailored solutions for SMEs, NGOs, and corporates" },
  ];

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">About Us</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-6">
              {s.company_name || "Taxwise Solutions"}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {s.about_description || ""}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {highlights.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="bg-muted rounded-lg p-6 text-center">
                  <item.icon className="h-10 w-10 text-green-brand mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2 font-sans">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection>
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Our Offices</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {(offices || []).map((office, i) => (
              <AnimatedSection key={office.id} delay={(i + 1) * 0.1}>
                <div className={`${i === 0 ? "bg-green-light" : "bg-gold-light"} rounded-xl p-8 border border-border`}>
                  <MapPin className={`h-8 w-8 ${i === 0 ? "text-green-brand" : "text-gold-dark"} mb-4`} />
                  <h3 className="text-xl font-bold text-foreground mb-3 font-sans">{office.name}</h3>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    {office.address && <li>{office.address}</li>}
                    {office.po_box && <li>{office.po_box}</li>}
                    <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> {office.phone}</li>
                    <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {office.email}</li>
                  </ul>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
