import { ImageResponse } from "next/og";

export const alt = "Division of Health AI — Northwell Health";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 400,
              color: "#E8E6E3",
              lineHeight: 1.1,
            }}
          >
            Division of Health AI
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#A09C97",
            }}
          >
            Northwell Health
          </div>
        </div>
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
            fontSize: 20,
            color: "#6B6762",
            marginTop: 32,
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          Advancing healthcare through artificial intelligence. Research in
          clinical AI, bioelectronic medicine, neural engineering, and medical
          imaging.
        </div>
      </div>
    ),
    { ...size },
  );
}
