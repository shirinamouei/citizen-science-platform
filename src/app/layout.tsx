import type { Metadata } from "next";
import { Halant, Oxygen } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

const halant = Halant({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-halant",
});

const oxygen = Oxygen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oxygen",
});

export const metadata: Metadata = {
  title: "TaperTrack",
  description:
    "Organize your tapering data in one place, and optionally donate it to support research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${halant.variable} ${oxygen.variable}`}>
      <body>
        <AuthProvider>
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
