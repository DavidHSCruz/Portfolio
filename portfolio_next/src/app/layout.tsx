import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ChatAssistant } from "@/components/chat-assistant";
import { MobileContact } from "@/components/mobile-contact";
import { SiteThemeProvider } from "@/components/site-theme";
import { ProjectTransitionProvider } from "@/components/project-transition";
import { getSiteUrl, site } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  alternates: { canonical: "/" },
  icons: { icon: "/icon.ico" },
  openGraph: { type: "website", locale: "pt_BR", siteName: site.name, title: site.title, description: site.description },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#060a0c", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: getSiteUrl(),
    email: site.email,
    sameAs: [site.linkedin, site.github],
    areaServed: "Brasil",
    description: site.description,
  };

  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" data-theme="dark">
      <body>
        <SiteThemeProvider>
          <ProjectTransitionProvider>
            <Header />
            {children}
            <Footer />
            <ChatAssistant />
            <MobileContact />
          </ProjectTransitionProvider>
        </SiteThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </body>
    </html>
  );
}
