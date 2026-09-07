import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Your Tapering Data",
  description:
    "Log doses, symptoms, and tapering notes in about two minutes. Submit as a signed-in user or anonymously as a guest.",
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
