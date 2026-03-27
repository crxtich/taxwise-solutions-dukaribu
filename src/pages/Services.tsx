import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { useServices } from "@/hooks/useSiteData";
import { getIcon } from "@/lib/iconMap";

const Services = () => {
  const { data: services } = useServices();

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">Our Expertise</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Services</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive accounting, tax, and advisory services tailored for businesses in Kenya.
            </p>
          </AnimatedSection>

          <div className="space-y-8">
            {(services || []).map((svc, i) => {
              const Icon = getIcon(svc.icon_name);
              const details = Array.isArray(svc.details) ? svc.details : [];
              return (
                <AnimatedSection key={svc.id} delay={i * 0.05}>
                  <div className="bg-card rounded-xl p-8 border border-border hover:border-gold/30 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="shrink-0">
                        <div className="w-14 h-14 bg-green-light rounded-lg flex items-center justify-center">
                          <Icon className="h-7 w-7 text-green-brand" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 font-sans">{svc.title}</h3>
                        <p className="text-muted-foreground mb-4">{svc.description}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {details.map((d: string, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-foreground/80">
                              <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                              {d}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection className="text-center mt-16">
            <Link to="/contact" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold inline-block hover:opacity-90 transition-opacity">
              Get in Touch
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
