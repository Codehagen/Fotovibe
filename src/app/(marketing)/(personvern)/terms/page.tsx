import { Metadata } from "next";
import { constructMetadata } from "@/lib/utils";
import { allLegalPosts } from "content-collections";
import LegalPage from "@/components/blog/legal";

export const metadata: Metadata = constructMetadata({
  title: "Personvern – Fotovibe",
  image: "/api/og/help?title=Personvern&summary=fotovibe.no/personvern",
});

export default function Terms() {
  const post = allLegalPosts.find((post) => post.slug === "terms")!;
  return <LegalPage post={post} />;
}
