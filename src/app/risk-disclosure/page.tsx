import type { Metadata } from "next";
import LegalPageView from "../legal-page";
import { legalPages } from "@/lib/legal-pages";

export const metadata: Metadata = {
  title: "Risk Disclosure | Hutridge Financial",
  description: "Read the Hutridge Financial Risk Disclosure.",
};

export default function RiskDisclosurePage() {
  return <LegalPageView page={legalPages["risk-disclosure"]} />;
}
