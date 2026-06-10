import type { Metadata } from "next";
import LegalPageView from "../legal-page";
import { legalPages } from "@/lib/legal-pages";

export const metadata: Metadata = {
  title: "Privacy Policy | Hutridge Financial",
  description: "Read the Hutridge Financial Privacy Policy.",
};

export default function PrivacyPolicyPage() {
  return <LegalPageView page={legalPages["privacy-policy"]} />;
}
