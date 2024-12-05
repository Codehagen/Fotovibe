import BlurFade from "@/components/magicui/blur-fade";
import Section from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, CalendarRange, Camera } from "lucide-react";

const steps = [
  {
    title: "1. Fortell oss hva du har bruk for",
    description:
      "Ta kontakt med oss for en uforpliktende prat om bedriften din og hva du ønsker å formidle gjennom bedriftsfoto. Jo bedre vi forstår din virksomhet, desto bedre kan vi tilpasse bildene til å speile det unike ved bedriften din.",
    icon: MessageCircle,
  },
  {
    title: "2. Vi planlegger bedriftsfotografering",
    description:
      "Våre fotografer utarbeider en grundig plan for hvordan vi best kan fange essensen av arbeidsplassen, de ansatte og bedriftens kultur. Vi diskuterer dine ønsker og behov for bedriftsfoto, og sender et tilpasset tilbud.",
    icon: CalendarRange,
  },
  {
    title: "3. Vi leverer bilde og video",
    description:
      "Når fotograferingen starter, sørger vi for at du blir involvert i prosessen, slik at resultatet samsvarer med din visjon. Vi leverer bilder og videoer som personifiserer bedriften din og etterlater et varig inntrykk.",
    icon: Camera,
  },
];

export default function ProcessSection() {
  return (
    <Section
      title="Hvordan fungerer Fotovibe?"
      subtitle="Enkel prosess, profesjonelle resultater"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {steps.map((step, index) => (
          <BlurFade key={index} delay={0.2 + index * 0.2} inView>
            <Card className="bg-background border-none shadow-none">
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </BlurFade>
        ))}
      </div>
    </Section>
  );
}
