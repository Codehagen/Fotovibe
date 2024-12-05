import Section from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Hvordan fungerer fotograf-abonnementet?",
    answer:
      "Med vårt abonnement får du tilgang til profesjonell fotografering hver måned. Vi sørger for alt fra planlegging til levering av ferdig redigerte bilder. Du får en dedikert fotograf som blir kjent med din bedrift og forstår dine behov.",
  },
  {
    question: "Hva er inkludert i abonnementet?",
    answer:
      "Abonnementet inkluderer månedlig fotografering, profesjonell bilderedigering, digital levering av høyoppløselige bilder, og rettigheter til å bruke bildene i all markedsføring. Vi tilbyr også rådgivning om hvordan bildene best kan brukes.",
  },
  {
    question: "Hvor lang tid tar det før vi får bildene?",
    answer:
      "Normalt leverer vi ferdig redigerte bilder innen 5 virkedager etter fotografering. Ved hasteoppdrag kan vi levere raskere etter avtale.",
  },
  {
    question: "Kan vi bruke samme fotograf hver gang?",
    answer:
      "Ja, det er nettopp det som er en av fordelene med vårt abonnement. Du får en dedikert fotograf som blir kjent med din bedrift og deres behov over tid.",
  },
  {
    question: "Hva hvis vi trenger ekstra fotografering en måned?",
    answer:
      "Som abonnent får du prioritert tilgang og rabatterte priser på ekstra fotografering. Kontakt din dedikerte fotograf for tilbud på tilleggstjenester.",
  },
];

export default function FAQ() {
  return (
    <Section>
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Ofte stilte spørsmål
        </h2>
        <p className="text-muted-foreground text-lg">
          Alt du lurer på om Fotovibe
          <br />
          og hvordan vi kan hjelpe deg.
        </p>
      </div>
      <div className="mx-auto my-12 md:max-w-[800px]">
        <Accordion
          type="single"
          collapsible
          className="flex w-full flex-col items-center justify-center space-y-2"
        >
          {faqs.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`faq-${idx}`}
              className="w-full border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className="px-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <h4 className="mb-12 text-center text-sm font-medium tracking-tight text-foreground/80">
        Har du flere spørsmål? Send oss en e-post på{" "}
        <a href="mailto:kontakt@fotovibe.as" className="underline">
          kontakt@fotovibe.as
        </a>
      </h4>
    </Section>
  );
}
