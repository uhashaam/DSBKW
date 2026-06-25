"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";

  // Standalone legacy page that should not render the global header/footer
  const hideChrome =
    pathname.startsWith("/zmt") ||
    pathname.startsWith("/zmt/");

  if (hideChrome) {
    return <main className="min-h-full">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
