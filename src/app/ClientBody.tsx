"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import {
  HelpProvider,
  HelpButton,
  HelpDrawer,
  GuidedTour,
  WelcomeTour,
} from "@/components/help";

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
        <HelpButton />
        <HelpDrawer />
        <GuidedTour />
        <WelcomeTour />
      </HelpProvider>
    </AuthProvider>
  );
}
