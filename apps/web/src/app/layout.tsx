import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-editorial",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  // Only the admin UI uses this face now; the storefront headings use
  // Merriweather (see (storefront)/layout.tsx), so don't preload it there.
  preload: false,
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Bee Hairplace — Premium Human Hair, Abuja",
    template: "%s | Bee Hairplace",
  },
  description:
    "Shop premium human hair wigs, bundles and closures in Abuja. Real videos of every piece, delivery across Abuja or pickup in-store.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
