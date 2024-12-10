import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fotovibe.as";

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
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
