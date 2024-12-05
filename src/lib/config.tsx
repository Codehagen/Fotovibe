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
          href: "/tjenester",
        },
        items: [
          {
            href: "/tjenester/stemningsbilder",
            title: "Stemningsbilder",
            description: "Fang den unike atmosfæren på arbeidsplassen din.",
          },
          {
            href: "/tjenester/portrett",
            title: "Portrettfotografering",
            description: "Profesjonelle portretter av ansatte og ledelse.",
          },
          {
            href: "/tjenester/lokaler",
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
      href: "/priser",
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
      href: "#",
      price: "$19",
      period: "month",
      yearlyPrice: "$16",
      features: [
        "1 User",
        "5GB Storage",
        "Basic Support",
        "Limited API Access",
        "Standard Analytics",
      ],
      description: "Perfect for individuals and small projects",
      buttonText: "Subscribe",
      isPopular: false,
    },
    {
      name: "PRO",
      href: "#",
      price: "$49",
      period: "month",
      yearlyPrice: "$40",
      features: [
        "5 Users",
        "50GB Storage",
        "Priority Support",
        "Full API Access",
        "Advanced Analytics",
      ],
      description: "Ideal for growing businesses and teams",
      buttonText: "Subscribe",
      isPopular: true,
    },
    {
      name: "ENTERPRISE",
      href: "#",
      price: "$99",
      period: "month",
      yearlyPrice: "$82",
      features: [
        "Unlimited Users",
        "500GB Storage",
        "24/7 Premium Support",
        "Custom Integrations",
        "AI-Powered Insights",
      ],
      description: "For large-scale operations and high-volume users",
      buttonText: "Subscribe",
      isPopular: false,
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
        { href: "/om-oss", text: "Om Fotovibe", icon: null },
        { href: "/photograph/sign-up", text: "Bli Fotograf", icon: null },
        { href: "/blog", text: "Blogg", icon: null },
        { href: "/kontakt", text: "Kontakt", icon: null },
      ],
    },
    {
      title: "Ressurser",
      links: [
        { href: "/personvern", text: "Personvernerklæring", icon: null },
        { href: "/vilkar", text: "Vilkår og Betingelser", icon: null },
        { href: "/faq", text: "Ofte Stilte Spørsmål", icon: null },
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
