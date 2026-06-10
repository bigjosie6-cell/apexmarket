import type { Metadata } from "next";
import LegalPageView from "../legal-page";
import { legalPages } from "@/lib/legal-pages";

export const metadata: Metadata = {
  title: "AML Policy | Hutridge Financial",
  description: "Read the Hutridge Financial AML Policy.",
};

export default function AmlPolicyPage() {
  return <LegalPageView page={legalPages["aml-policy"]} />;
}
