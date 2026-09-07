import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Cascade account or create a new one.",
  robots: { index: false, follow: true },
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
