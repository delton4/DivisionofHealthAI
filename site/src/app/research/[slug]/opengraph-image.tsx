import { ImageResponse } from "next/og";
import { getProjectWithOverrides } from "@/data";

export const alt = "Research Project — Division of Health AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateImageMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return [{ id: params.slug, alt: `Research project at Division of Health AI` }];
}

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const project = await getProjectWithOverrides(params.slug);

  const name = project?.name ?? "Research Project";
  const about = project?.about?.slice(0, 150) ?? "";

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
          Division of Health AI &middot; Research
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 400,
            color: "#E8E6E3",
            lineHeight: 1.1,
            maxWidth: 900,
          }}
        >
          {name}
        </div>
        <div
          style={{
            width: 80,
            height: 3,
            background: "#6AADCE",
            marginTop: 32,
          }}
        />
        {about && (
          <div
            style={{
              fontSize: 20,
              color: "#6B6762",
              marginTop: 24,
              maxWidth: 800,
              lineHeight: 1.5,
            }}
          >
            {about}...
          </div>
        )}
      </div>
    ),
    { ...size },
  );
}
