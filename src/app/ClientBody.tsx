"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelpProvider } from "@/components/help/HelpProvider";
import { HelpButton } from "@/components/help/HelpButton";
import { HelpDrawer } from "@/components/help/HelpDrawer";
import { GuidedTour } from "@/components/help/GuidedTour";

export default function ClientBody({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove any extension-added classes during hydration
  useEffect(() => {
    // This runs only on the client after hydration
    document.body.className = "antialiased";
  }, []);

  return (
    <AuthProvider>
      <HelpProvider>
        <div className="antialiased">{children}</div>
        {/* Global, context-aware help — available on every page */}
        <HelpButton />
        <HelpDrawer />
        <GuidedTour />
      </HelpProvider>
    </AuthProvider>
  );
}
