import { ImageResponse } from "next/og";
import { getResearcherWithOverrides } from "@/data";

export const alt = "Researcher — Division of Health AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const researcher = await getResearcherWithOverrides(slug);

  const name = researcher?.name ?? "Researcher";
  const title = researcher?.title ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#141211",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 20,
            color: "#6AADCE",
            marginBottom: 16,
          }}
        >
          Division of Health AI
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 400,
            color: "#E8E6E3",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        {title && (
          <div
            style={{
              fontSize: 24,
              color: "#A09C97",
              marginTop: 16,
              maxWidth: 800,
            }}
          >
            {title}
          </div>
        )}
        <div
          style={{
            width: 80,
            height: 3,
            background: "#6AADCE",
            marginTop: 32,
          }}
        />
        <div
          style={{
            fontSize: 18,
            color: "#6B6762",
            marginTop: 24,
          }}
        >
          Northwell Health · Feinstein Institutes for Medical Research
        </div>
      </div>
    ),
    { ...size },
  );
}
