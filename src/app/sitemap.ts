import { MetadataRoute } from "next";
import { headers } from "next/headers";
import {
  allBlogPosts,
  allChangelogPosts,
  allCustomersPosts,
  allHelpPosts,
  allLegalPosts,
  allIntegrationsPosts,
} from "content-collections";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = headers();
  const domain = headersList.get("host") as string;
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${domain}`;

  // Static public pages
  const staticPages = [
    "/",
    "/about",
    "/contact",
    "/pricing",
    "/compare",
    "/blog",
    "/help",
    "/changelog",
    "/customers",
    "/integrations",
    "/legal",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 1.0,
  }));

  // Dynamic content pages
  const blogPages = allBlogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const changelogPages = allChangelogPosts.map((post) => ({
    url: `${baseUrl}/changelog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const customerPages = allCustomersPosts.map((post) => ({
    url: `${baseUrl}/customers/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const helpPages = allHelpPosts.map((post) => ({
    url: `${baseUrl}/help/article/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const legalPages = allLegalPosts.map((post) => ({
    url: `${baseUrl}/legal/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  const integrationPages = allIntegrationsPosts.map((post) => ({
    url: `${baseUrl}/integrations/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...blogPages,
    ...changelogPages,
    ...customerPages,
    ...helpPages,
    ...legalPages,
    ...integrationPages,
  ];
}
