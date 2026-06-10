import type { Metadata } from "next";
import LegalPageView from "../legal-page";
import { legalPages } from "@/lib/legal-pages";

export const metadata: Metadata = {
  title: "KYC Policy | Hutridge Financial",
  description: "Read the Hutridge Financial KYC Policy.",
};

export default function KycPolicyPage() {
  return <LegalPageView page={legalPages["kyc-policy"]} />;
}
