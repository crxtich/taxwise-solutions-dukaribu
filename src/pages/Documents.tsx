import { FolderOpen, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { Link } from "react-router-dom";
import { useDocumentSteps, useDocumentFolders } from "@/hooks/useSiteData";
import { getIcon } from "@/lib/iconMap";

const Documents = () => {
  const { data: steps } = useDocumentSteps();
  const { data: folders } = useDocumentFolders();

  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <AnimatedSection className="text-center mb-16">
            <span className="text-gold font-medium text-sm uppercase tracking-wider">Document Management</span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">Your Digital Document Portal</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We use Google Drive to provide each client with a secure, organized document management system. No more lost receipts or missing invoices.
            </p>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {(steps || []).map((s, i) => {
              const Icon = getIcon(s.icon_name);
              return (
                <AnimatedSection key={s.id} delay={i * 0.1}>
                  <div className="text-center">
                    <div className="w-14 h-14 bg-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 text-green-brand" />
                    </div>
                    <div className="text-xs font-bold text-gold mb-2">STEP {i + 1}</div>
                    <h3 className="font-semibold text-foreground mb-2 font-sans">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.description}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>

          <AnimatedSection>
            <div className="bg-muted rounded-xl p-8 mb-12">
              <h3 className="font-bold text-foreground mb-6 text-lg font-sans">📁 Your Folder Structure</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(folders || []).map((f) => (
                  <div key={f.id} className="bg-card rounded-lg px-4 py-3 flex items-center gap-3 border border-border">
                    <FolderOpen className="h-5 w-5 text-gold shrink-0" />
                    <span className="text-sm font-medium text-foreground">{f.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection className="text-center">
            <Link to="/contact" className="bg-gold text-navy px-8 py-3 rounded-md font-semibold inline-block hover:opacity-90 transition-opacity">
              Request Your Document Portal Setup
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Documents;
