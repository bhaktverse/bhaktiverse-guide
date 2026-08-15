import Navigation from "@/components/Navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import OfflineCacheSettings from "@/components/OfflineCacheSettings";
import { usePageTitle } from "@/hooks/usePageTitle";

const OfflineSettings = () => {
  usePageTitle(
    "Offline Settings | BhaktVerse",
    "Manage your offline bhajan and mantra downloads, clear cached audio and app assets, and refresh offline storage.",
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto max-w-3xl px-4 pb-24 pt-20 sm:pt-24">
        <Breadcrumbs items={[{ label: "Profile", href: "/profile" }, { label: "Offline Settings" }]} />
        <header className="mb-6 mt-2">
          <h1 className="text-2xl font-bold sm:text-3xl">Offline Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Control what BhaktVerse keeps on your device for offline listening.
          </p>
        </header>
        <OfflineCacheSettings />
      </main>
    </div>
  );
};

export default OfflineSettings;
