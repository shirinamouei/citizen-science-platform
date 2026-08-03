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
  title: "Cascade",
  description:
    "Donate your tapering data to support research and future patients. Create an account to bring it all together first, no matter the format it's in.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${halant.variable} ${oxygen.variable}`}>
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
