import { GraduationCap, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { useTrainingTopics, useTrainingFormats } from "@/hooks/useSiteData";

const Training = () => {
  const { data: topics } = useTrainingTopics();
  const { data: formats } = useTrainingFormats();

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection className="text-center mb-16">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">Capacity Building</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Training & Sensitization</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We offer compliance training packages designed to empower your team with the knowledge to manage statutory obligations confidently.
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <AnimatedSection>
              <div className="bg-green-light rounded-xl p-8 h-full">
                <GraduationCap className="h-12 w-12 text-green-brand mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-4 font-sans">What We Cover</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Our training sessions cover all key statutory compliance areas relevant to Kenyan businesses.
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {(topics || []).map((t) => (
                    <div key={t.id} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle className="h-4 w-4 text-green-brand shrink-0" /> {t.name}
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="space-y-6">
                {(formats || []).map((item) => (
                  <div key={item.id} className="bg-card border border-border rounded-lg p-6 hover:border-gold/30 transition-colors">
                    <h4 className="font-semibold text-foreground mb-2 font-sans">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>

          <AnimatedSection className="text-center">
            <Link to="/contact" className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold inline-block hover:opacity-90 transition-opacity">
              Book a Training Session
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Training;
