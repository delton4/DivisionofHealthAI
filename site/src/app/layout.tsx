import type { Metadata } from "next";
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
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Division of Health AI | Northwell Health",
    template: "%s | Division of Health AI",
  },
  description:
    "Advancing healthcare through artificial intelligence at Northwell Health.",
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
