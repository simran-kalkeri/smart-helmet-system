import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AccidentProvider } from "@/context/AccidentContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Helmet Dashboard",
  description: "Real-time monitoring for rider safety",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <AccidentProvider>
            {children}
          </AccidentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
