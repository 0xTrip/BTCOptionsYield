import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConnectWalletDialog } from "@/components/dialogs/ConnectWallet";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Options from "@/pages/Options";
import Stake from "@/pages/Stake";
import NotFound from "@/pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Layout({ variant }: { variant: "marketing" | "app" }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav variant={variant} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <TooltipProvider>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout variant="marketing" />}>
          <Route index element={<Landing />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="app" element={<Layout variant="app" />}>
          <Route index element={<Dashboard />} />
          <Route path="stake" element={<Stake />} />
          <Route path="options" element={<Options />} />
        </Route>
      </Routes>
      <ConnectWalletDialog />
    </TooltipProvider>
  );
}
