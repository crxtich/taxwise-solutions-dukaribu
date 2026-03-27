import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { clientLogos } from "@/data/clients";

type ClientShowcaseProps = {
  mode?: "carousel" | "grid";
};

const sectionCopy = {
  eyebrow: "Who We've Served",
  title: "Trusted by organizations across sectors",
  description:
    "A selection of brands, trusts, foundations, and community organizations that have worked with Taxwise Solutions.",
};

const ClientShowcase = ({ mode = "carousel" }: ClientShowcaseProps) => {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (mode !== "carousel" || !api) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
        return;
      }

      api.scrollTo(0);
    }, 3200);

    return () => window.clearInterval(intervalId);
  }, [api, mode]);

  return (
    <div>
      <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-gold font-medium text-sm uppercase tracking-wider">{sectionCopy.eyebrow}</span>
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">{sectionCopy.title}</h2>
        <p className="text-muted-foreground">{sectionCopy.description}</p>
      </AnimatedSection>

      {mode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clientLogos.map((client, index) => (
            <AnimatedSection key={client.name} delay={index * 0.04}>
              <div className="rounded-2xl border border-border bg-card px-6 py-8 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-28 items-center justify-center rounded-xl bg-white p-4">
                  <img
                    src={client.image}
                    alt={`${client.name} logo`}
                    className="max-h-full w-auto max-w-full object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="mt-5 text-center text-sm font-semibold text-foreground">{client.name}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <AnimatedSection>
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: false,
              dragFree: true,
            }}
            className="px-1 md:px-10"
          >
            <CarouselContent>
              {clientLogos.map((client) => (
                <CarouselItem key={client.name} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                  <div className="rounded-2xl border border-border bg-card px-5 py-6 h-full">
                    <div className="flex h-24 items-center justify-center rounded-xl bg-white p-4">
                      <img
                        src={client.image}
                        alt={`${client.name} logo`}
                        className="max-h-full w-auto max-w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="mt-4 text-center text-sm font-semibold text-foreground">{client.name}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mt-8 text-center">
            <Link to="/clients" className="text-green-brand font-semibold hover:underline">
              View all clients →
            </Link>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
};

export default ClientShowcase;
