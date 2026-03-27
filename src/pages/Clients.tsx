import Layout from "@/components/Layout";
import ClientShowcase from "@/components/ClientShowcase";

const Clients = () => {
  return (
    <Layout>
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <ClientShowcase mode="grid" />
        </div>
      </section>
    </Layout>
  );
};

export default Clients;
