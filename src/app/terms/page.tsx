import type { Metadata } from "next";
import LegalPageView from "../legal-page";
import { legalPages } from "@/lib/legal-pages";

export const metadata: Metadata = {
  title: "Terms & Conditions | Hutridge Financial",
  description: "Read the Hutridge Financial Terms & Conditions.",
};

export default function TermsPage() {
  return <LegalPageView page={legalPages.terms} />;
}
