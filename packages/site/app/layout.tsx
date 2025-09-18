import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { WalletButton } from "../components/WalletButton";

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
      <body className="zama-bg text-foreground antialiased">
        <div className="fixed inset-0 w-full h-full zama-bg z-[-20] min-w-[850px]" />

        <main className="flex flex-col h-screen max-w-screen-lg mx-auto min-w-[850px]">
          <Providers>
            {/* Header Panel - 10% */}
            <div className="header-panel flex w-full px-3 md:px-0 py-6 justify-between items-center h-[10%]">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold text-gray-800">EncryptoVote</h1>
              </div>
              <WalletButton />
            </div>

            {/* Main Panel - 80% */}
            <div className="main-panel w-full py-6 flex justify-center h-[80%] overflow-hidden">
              <div className="w-full h-full flex justify-center items-center">
                {children}
              </div>
            </div>
          </Providers>

          {/* Footer Panel - 10% */}
          <div className="footer-panel w-full py-6 text-center text-sm text-gray-600 h-[10%] flex flex-col justify-center">
            <p>© 2025 Zama FHEVM. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
              <a href="https://twitter.com/zama_fhevm" target="_blank" rel="noreferrer">
                Twitter
              </a>
              <a href="https://github.com/zama-ai" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a href="https://zama.ai" target="_blank" rel="noreferrer">
                Website
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
