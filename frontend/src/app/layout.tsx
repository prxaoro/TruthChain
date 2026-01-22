import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TruthChain | Anonymous Whistleblower Platform",
  description: "Expose corruption anonymously. Prove insider status without revealing identity. Powered by Aleo zero-knowledge proofs.",
  keywords: ["whistleblower", "anonymous", "privacy", "zero-knowledge", "aleo", "blockchain"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} antialiased bg-black text-white`}>
        <ClientWrapper>
          <div className="gradient-bg min-h-screen">
            {children}
          </div>
        </ClientWrapper>
      </body>
    </html>
  );
}
