import Features from "@/components/features-horizontal";
import Section from "@/components/section";
import { Users, User, Building, Presentation } from "lucide-react";

function FeaturesPill() {
  return (
    <div className="mx-auto mb-8 flex w-fit items-center space-x-2 rounded-full bg-primary/20 px-2 py-1 ring-1 ring-primary/30">
      <p className="text-xs font-medium text-primary sm:text-sm">
        📸 Våre tjenester
      </p>
    </div>
  );
}

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
    <Section>
      <FeaturesPill />
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Profesjonell fotografering,{" "}
          <span className="block">tilpasset dine behov</span>
        </h2>
        <p className="text-muted-foreground text-lg">
          Vi tilpasser fotograferingen til dine behov, fra stemningsbilder til
          portretter og produktbilder.
          <br />
          Vi har erfaring med alt fra små bedrifter til store internasjonale
          selskaper.
        </p>
      </div>
      <Features collapseDelay={5000} linePosition="bottom" data={data} />
    </Section>
  );
}
