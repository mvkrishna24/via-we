import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { company } from "@/data/content";
import "./globals.css";

const fraunces = localFont({
  src: "../fonts/fraunces-var.woff2",
  variable: "--font-fraunces",
  weight: "300 900",
  display: "swap",
});

const roboto = localFont({
  src: "../fonts/roboto-var.woff2",
  variable: "--font-roboto",
  weight: "100 900",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.via-we.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Via-We Services Pvt. Ltd. — Your Dreams. Our Aim.",
    template: "%s · Via-We Services",
  },
  description:
    "Step into a digital consultation with Via-We — brand building, business setup, franchising, recruitment, marketing and infrastructure for ambitious businesses across Andhra Pradesh.",
  keywords: [
    "Via-We Services",
    "business consulting Vijayawada",
    "franchise setup Andhra Pradesh",
    "brand building",
    "business setup",
    "recruitment services",
    "digital marketing Vijayawada",
    "restaurant setup",
    "interior finishing",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: company.name,
    title: "Via-We Services — A Digital Business Consultation Experience",
    description:
      "Meet Vijay inside a premium virtual office. Launch, scale and transform your business with one integrated team.",
    images: [{ url: "/brand/og-image.jpg", width: 1200, height: 630, alt: "Via-We Services — Your Dreams Our Aim" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Via-We Services — Your Dreams. Our Aim.",
    description:
      "A next-generation digital consultation experience for business growth.",
    images: ["/brand/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050d17",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: company.name,
  slogan: company.tagline,
  url: siteUrl,
  telephone: company.phoneDisplay,
  email: company.email,
  founder: { "@type": "Person", name: company.founder.name, jobTitle: company.founder.role },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Labbipet, near Vivanta",
    addressLocality: "Vijayawada",
    addressRegion: "Andhra Pradesh",
    addressCountry: "IN",
  },
  areaServed: company.branches.map((city) => ({ "@type": "City", name: city })),
  makesOffer: [
    "Brand Building",
    "Recruitment",
    "Franchising",
    "Digital Marketing",
    "Business Setup",
    "Infrastructure Making",
    "Skill Development",
    "Graphic Designing",
    "Printing Services",
    "Offline Marketing",
    "Location Setup",
    "Interior Finishing",
  ].map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${roboto.variable}`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
