import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { Users, User, Building, Presentation } from "lucide-react";

const data = [
  {
    id: 1,
    title: "Stemningsbilder",
    content:
      "Fang den unike atmosfæren på arbeidsplassen din. Vi tar autentiske bilder av ansatte i naturlige arbeidssituasjoner som viser bedriftskulturen og miljøet.",
    image: "/dashboard.png",
    icon: <Users className="h-6 w-6 text-primary" />,
  },
  {
    id: 2,
    title: "Portrettfotografering",
    content:
      "Profesjonelle portretter av ansatte til nettsider, sosiale medier og markedsføring. Vi sørger for at personligheten skinner gjennom i hvert bilde.",
      image: "/dashboard.png",
    icon: <User className="h-6 w-6 text-primary" />,
  },
  {
    id: 3,
    title: "Lokaler og Fasiliteter",
    content:
      "Vis frem lokalene og fasilitetene deres fra sin beste side. Perfekt for nettsider, eiendomsvisninger eller markedsføringsmateriell.",
      image: "/dashboard.png",
    icon: <Building className="h-6 w-6 text-primary" />,
  },
  {
    id: 4,
    title: "Produkt og Tjenester",
    content:
      "Fremhev produktene eller tjenestene deres med profesjonelle bilder som viser kvalitet og detaljer. Ideelt for nettbutikk, kataloger og presentasjoner.",
    image: "/dashboard.png",  
    icon: <Presentation className="h-6 w-6 text-primary" />,
  },
];

export default function PhotoTypes() {
  return (
    <Section
      title="Våre Fototjenester"
      subtitle="Profesjonell fotografering tilpasset ditt behov"
    >
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
}
