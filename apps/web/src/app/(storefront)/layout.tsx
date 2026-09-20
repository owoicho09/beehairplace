import { Merriweather } from "next/font/google";

import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontNav } from "@/components/storefront/nav";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";

const merriweather = Merriweather({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${merriweather.variable} flex flex-1 flex-col bg-store-bg text-store-ink`}
    >
      <StorefrontNav />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
      <WhatsAppButton />
    </div>
  );
}
