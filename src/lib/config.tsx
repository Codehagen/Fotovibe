import { Icons } from "@/components/icons";
import { FaTwitter } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa6";
import { RiInstagramFill } from "react-icons/ri";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";

export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Fotovibe",
  description: "Profesjonell bedriftsfotografering på abonnement",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: ["Bedriftsfoto", "Fotografering", "Abonnement", "Norge"],
  links: {
    email: "kontakt@fotovibe.as",
    instagram: "https://instagram.com/fotovibe.as",
    facebook: "https://facebook.com/fotovibe.as",
    linkedin: "https://linkedin.com/company/fotovibe",
  },
  header: [
    {
      trigger: "Tjenester",
      content: {
        main: {
          icon: <Icons.logo className="h-6 w-6" />,
          title: "Bedriftsfotografering",
          description:
            "Profesjonell foto og video på abonnement for din bedrift.",
          href: "/",
        },
        items: [
          {
            href: "//stemningsbilder",
            title: "Stemningsbilder",
            description: "Fang den unike atmosfæren på arbeidsplassen din.",
          },
          {
            href: "//portrett",
            title: "Portrettfotografering",
            description: "Profesjonelle portretter av ansatte og ledelse.",
          },
          {
            href: "//lokaler",
            title: "Lokaler og Fasiliteter",
            description: "Vis frem bedriftens lokaler fra sin beste side.",
          },
        ],
      },
    },
    {
      trigger: "Løsninger",
      content: {
        items: [
          {
            title: "For Små Bedrifter",
            href: "/losninger/sma-bedrifter",
            description: "Skreddersydde fotopakker for voksende bedrifter.",
          },
          {
            title: "For Store Bedrifter",
            href: "/losninger/store-bedrifter",
            description: "Omfattende løsninger for større organisasjoner.",
          },
          {
            title: "For Eiendomsmeglere",
            href: "/losninger/eiendom",
            description: "Spesialtilpasset for eiendomsfotografering.",
          },
          {
            title: "For Restauranter",
            href: "/losninger/restaurant",
            description: "Mat- og stemningsfotografering for serveringssteder.",
          },
          {
            title: "For Hoteller",
            href: "/losninger/hotell",
            description: "Omfattende fotopakker for overnattingssteder.",
          },
          {
            title: "For Butikker",
            href: "/losninger/butikk",
            description: "Visuelt innhold for fysiske og nettbaserte butikker.",
          },
        ],
      },
    },
    {
      href: "/customers",
      label: "Kunder",
    },
    {
      href: "/pricing",
      label: "Priser",
    },
    {
      href: "/blog",
      label: "Blogg",
    },
  ],
  pricing: [
    {
      name: "BASIC",
      href: "/sign-up",
      price: "10000",
      period: "mnd",
      yearlyPrice: "8333",
      features: [
        "1 fotosesjon per måned",
        "20 høyoppløselige bilder",
        "Profesjonell bilderedigering",
        "Digital bildemappe",
        "Ubegrenset nedlastinger",
        "24/48 timers levering",
        "Ingen bindingstid",
      ],
      description: "Perfekt for små og mellomstore bedrifter",
      buttonText: "Kom i gang",
      isPopular: false,
      billingText: {
        monthly: "fakturert månedlig",
        yearly: "fakturert månedlig",
      },
    },
    {
      name: "PRO",
      href: "/sign-up",
      price: "15000",
      period: "mnd",
      yearlyPrice: "12500",
      features: [
        "1 fotosesjon per måned",
        "40 høyoppløselige bilder",
        "3-5 korte videosnutter",
        "Sosiale medier-pakke",
        "Prioritert fotograftilgang",
        "24 timers levering",
        "Dedikert kundeansvarlig",
        "Ingen bindingstid",
      ],
      description:
        "Ideell for voksende bedrifter med aktiv digital tilstedeværelse",
      buttonText: "Kom i gang",
      isPopular: true,
      billingText: {
        monthly: "fakturert månedlig",
        yearly: "fakturert måndelig",
      },
    },
    {
      name: "ENTERPRISE",
      href: "/sign-up",
      price: "20000",
      period: "mnd",
      yearlyPrice: "16667",
      features: [
        "1 fotosesjon per måned",
        "Ubegrenset antall bilder",
        "Skreddersydd videoproduksjon",
        "Drone-fotografering",
        "Egen dedikert fotograf",
        "Express levering (12 timer)",
        "Prioritert support 24/7",
        "Eksklusiv bilderettigheter",
      ],
      description: "For større bedrifter med omfattende behov",
      buttonText: "Kontakt oss",
      isPopular: false,
      billingText: {
        monthly: "fakturert månedlig",
        yearly: "fakturert månedlig",
      },
    },
  ],
  faqs: [
    {
      question: "What is fotovibe?",
      answer: (
        <span>
          fotovibe is a platform that helps you build and manage your AI-powered
          applications. It provides tools and services to streamline the
          development and deployment of AI solutions.
        </span>
      ),
    },
    {
      question: "How can I get started with fotovibe?",
      answer: (
        <span>
          You can get started with fotovibe by signing up for an account on our
          website, creating a new project, and following our quick-start guide.
          We also offer tutorials and documentation to help you along the way.
        </span>
      ),
    },
    {
      question: "What types of AI models does fotovibe support?",
      answer: (
        <span>
          fotovibe supports a wide range of AI models, including but not limited
          to natural language processing, computer vision, and predictive
          analytics. We continuously update our platform to support the latest
          AI technologies.
        </span>
      ),
    },
    {
      question: "Is fotovibe suitable for beginners in AI development?",
      answer: (
        <span>
          Yes, fotovibe is designed to be user-friendly for both beginners and
          experienced developers. We offer intuitive interfaces, pre-built
          templates, and extensive learning resources to help users of all skill
          levels create AI-powered applications.
        </span>
      ),
    },
    {
      question: "What kind of support does fotovibe provide?",
      answer: (
        <span>
          fotovibe provides comprehensive support including documentation, video
          tutorials, a community forum, and dedicated customer support. We also
          offer premium support plans for enterprises with more complex needs.
        </span>
      ),
    },
  ],
  footer: [
    {
      title: "Tjenester",
      links: [
        { href: "#tjenester", text: "Stemningsbilder", icon: null },
        { href: "#tjenester", text: "Portrettfotografering", icon: null },
        { href: "#tjenester", text: "Lokaler og Fasiliteter", icon: null },
        { href: "#tjenester", text: "Produkt og Tjenester", icon: null },
      ],
    },
    {
      title: "Om Oss",
      links: [
        { href: "/", text: "Om Fotovibe", icon: null },
        { href: "/photograph/sign-up", text: "Bli Fotograf", icon: null },
        { href: "/blog", text: "Blogg", icon: null },
        { href: "/kundeservice", text: "Kundeservice", icon: null },
      ],
    },
    {
      title: "Ressurser",
      links: [
        { href: "/help", text: "Hjelpesenter", icon: null },
        { href: "/terms", text: "Vilkår og Betingelser", icon: null },
        { href: "/", text: "Ofte Stilte Spørsmål", icon: null },
        { href: "/kundeservice", text: "Kundeservice", icon: null },
      ],
    },
    {
      title: "Følg Oss",
      links: [
        {
          href: "https://instagram.com/fotovibe.as",
          text: "Instagram",
          icon: <RiInstagramFill />,
        },
        {
          href: "https://facebook.com/fotovibe.as",
          text: "Facebook",
          icon: <FaFacebook />,
        },
        {
          href: "https://linkedin.com/company/fotovibe",
          text: "LinkedIn",
          icon: <FaLinkedin />,
        },
      ],
    },
  ],
};

export type SiteConfig = typeof siteConfig;
