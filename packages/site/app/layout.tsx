import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { WalletButton } from "../components/WalletButton";
import { AppHeader } from "../components/AppHeader";
import { NavigationProvider } from "../contexts/NavigationContext";

export const metadata: Metadata = {
  title: "Zama FHEVM SDK Quickstart",
  description: "Zama FHEVM SDK Quickstart app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-header-bg text-foreground antialiased">
        <div className="fixed inset-0 w-full h-full app-header-bg z-[-20]" />

        <div>
          <Providers>
            <NavigationProvider>
              {/* App Header */}
              <header className="sticky top-0 z-50">
                <AppHeader />
              </header>
              
              {/* Main Content */}
              <main className="app-header-bg">
                {children}
              </main>
            </NavigationProvider>
          </Providers>
        </div>
      </body>
    </html>
  );
}
