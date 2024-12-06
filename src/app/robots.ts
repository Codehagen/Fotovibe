import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fotovibe.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/*", "/help/*", "/changelog/*", "/legal/*"],
        disallow: [
          "/api/",
          "/_next/",
          "/admin/*",
          "/dashboard/*",
          "/editor/*",
          "/fotograf/*",
          "/ordre/*",
          "/invoices/*",
          "/settings/*",
          "/auth/*",
          "/private/*",
          "/*.json$",
          "/*.xml$",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/blog/*", "/help/*"],
        disallow: ["/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
