import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToastProvider } from "@/components/ui/Toast";
import { ConditionalHeader } from "@/components/ConditionalHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "IKEDC Prepaid - Electricity Token Purchase",
  description: "Purchase electricity prepaid tokens for IKEDC meters",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <ToastProvider>
          <div className="h-screen flex flex-col">
            <ConditionalHeader />
            <main className="flex-1 px-4 py-4 min-h-0">
              <div className="h-full max-w-md mx-auto flex flex-col">
                {children}
              </div>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}