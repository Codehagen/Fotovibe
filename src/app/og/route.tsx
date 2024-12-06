import { Icons } from "@/components/icons";
import { siteConfig } from "@/lib/config";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const postTitle = searchParams.get("title");
  const type = searchParams.get("type") || "default";

  const font = fetch(
    new URL("../../assets/fonts/Inter-SemiBold.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  // Define different layouts based on content type
  const layouts = {
    blog: {
      title: postTitle || "Blog",
      subtitle: "FotoVibe Blog",
    },
    help: {
      title: postTitle || "Help Center",
      subtitle: "FotoVibe Documentation",
    },
    customers: {
      title: postTitle || "Customer Stories",
      subtitle: "FotoVibe Customer Success",
    },
    integrations: {
      title: postTitle || "Integrations",
      subtitle: "FotoVibe Integrations",
    },
    default: {
      title: postTitle || siteConfig.description,
      subtitle: siteConfig.name,
    },
  };

  const layout = layouts[type as keyof typeof layouts] || layouts.default;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          backgroundImage: `url(${siteConfig.url}/og.png)`,
          fontSize: 32,
          fontWeight: 600,
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            top: "125px",
          }}
        >
          <Icons.logo
            style={{
              width: "64px",
              height: "64px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "64px",
              fontWeight: "600",
              marginTop: "24px",
              textAlign: "center",
              width: "80%",
              letterSpacing: "-0.05em",
            }}
          >
            {layout.title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "16px",
              fontWeight: "500",
              marginTop: "16px",
              color: "#808080",
            }}
          >
            {layout.subtitle}
          </div>
        </div>

        {type === "default" && (
          <img
            src={`${siteConfig.url}/_static/thumbnail.png`}
            width={900}
            style={{
              position: "relative",
              bottom: -160,
              aspectRatio: "auto",
              border: "4px solid lightgray",
              background: "lightgray",
              borderRadius: 20,
              zIndex: 1,
            }}
          />
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
}
