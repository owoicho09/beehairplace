import { StorefrontFooter } from "@/components/storefront/footer";
import { StorefrontNav } from "@/components/storefront/nav";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StorefrontNav />
      <main className="flex-1">{children}</main>
      <StorefrontFooter />
      <WhatsAppButton />
    </>
  );
}
