import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AdminProvider } from "@/components/AdminProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#141211",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://divhealthai.org"),
  title: {
    default: "Division of Health AI | Northwell Health",
    template: "%s | Division of Health AI",
  },
  description:
    "Advancing healthcare through artificial intelligence at Northwell Health. Research in clinical AI, bioelectronic medicine, neural engineering, and medical imaging.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Division of Health AI",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_logged_in")?.value === "1";

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ResearchOrganization",
              name: "Division of Health AI",
              url: "https://divhealthai.org",
              description:
                "Advancing healthcare through artificial intelligence at Northwell Health. Research in clinical AI, bioelectronic medicine, neural engineering, and medical imaging.",
              address: {
                "@type": "PostalAddress",
                streetAddress: "350 Community Dr",
                addressLocality: "Manhasset",
                addressRegion: "NY",
                postalCode: "11030",
                addressCountry: "US",
              },
              parentOrganization: {
                "@type": "Organization",
                name: "Feinstein Institutes for Medical Research",
                url: "https://feinstein.northwell.edu",
                parentOrganization: {
                  "@type": "Organization",
                  name: "Northwell Health",
                  url: "https://www.northwell.edu",
                },
              },
              keywords: [
                "health AI",
                "clinical AI",
                "bioelectronic medicine",
                "neural engineering",
                "medical imaging",
                "machine learning",
                "healthcare",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Division of Health AI",
              url: "https://divhealthai.org",
            }),
          }}
        />
        <AdminProvider isAdmin={isAdmin}>
          <Navigation />
          <main className="flex-1">{children}</main>
          <Footer />
        </AdminProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
