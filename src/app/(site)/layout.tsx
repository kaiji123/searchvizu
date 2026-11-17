import { Footer, Header } from "@/components/site/SiteChrome";
import { PortalProvider } from "@/components/site/PortalProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider><div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div></PortalProvider>
  );
}
