import type { Metadata } from "next";
import { Fraunces, Sora } from "next/font/google";
import { AccessibilityBar } from "@/components/AccessibilityBar";
import { AccessibilityProvider } from "@/lib/accessibility/AccessibilityContext";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Prisma | Corporación Penser",
  description:
    "Prisma, el ecosistema digital de Corporación Penser para personas mayores de 60 años.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${sora.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <AccessibilityProvider>
          <AccessibilityBar />
          {children}
        </AccessibilityProvider>
      </body>
    </html>
  );
}
