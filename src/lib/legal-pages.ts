export type LegalPage = {
  title: string;
  updated: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string[];
  }>;
};

export const legalPages: Record<string, LegalPage> = {
  "privacy-policy": {
    title: "Privacy Policy",
    updated: "June 10, 2026",
    intro:
      "This Privacy Policy explains how Hutridge Financial collects, uses, stores, and protects personal information submitted through this website, account forms, client portal, support channels, and related services.",
    sections: [
      {
        heading: "Information we collect",
        body: [
          "We may collect identifying information such as name, email address, phone number, country of residence, account preferences, funding method selections, support messages, login activity, and information submitted through account registration forms.",
          "We may also collect technical information such as device type, browser, IP-derived location, pages visited, timestamps, and security logs to help protect the platform and improve user experience.",
        ],
      },
      {
        heading: "How information is used",
        body: [
          "Information may be used to create and maintain client profiles, respond to support requests, send account notifications, review onboarding details, display client portal information, and protect against unauthorized access or misuse.",
          "We may use contact details to send service emails related to account applications, deposits, support tickets, security alerts, and important platform updates.",
        ],
      },
      {
        heading: "Data protection",
        body: [
          "We use reasonable administrative, technical, and organizational safeguards designed to protect user information from unauthorized access, disclosure, alteration, or destruction.",
          "No internet-based platform can guarantee absolute security, and users should keep their login details private and contact support if they suspect unauthorized access.",
        ],
      },
      {
        heading: "Sharing of information",
        body: [
          "We do not sell personal information. Information may be shared with service providers that support hosting, email delivery, customer support, security, analytics, or regulatory and compliance operations.",
          "Information may also be disclosed if required by law, legal process, fraud prevention needs, or to protect the rights and safety of Hutridge Financial, clients, or the public.",
        ],
      },
      {
        heading: "User choices",
        body: [
          "Users may request access, correction, or deletion of personal information where applicable by contacting support. Some records may need to be retained for security, compliance, dispute resolution, or legitimate business purposes.",
        ],
      },
      {
        heading: "Contact",
        body: ["Privacy questions can be sent to support@hutridgefinancial.com. This policy may be updated as the platform, services, or applicable requirements change."],
      },
    ],
  },
  terms: {
    title: "Terms & Conditions",
    updated: "June 10, 2026",
    intro: "These Terms & Conditions govern use of the Hutridge Financial website, account registration pages, client portal, support features, and related online services.",
    sections: [
      {
        heading: "Use of the website",
        body: [
          "Users agree to provide accurate information, use the website lawfully, and avoid activity that could interfere with site security, availability, or other users.",
          "The website may include informational tools, indicative market displays, account forms, deposit request workflows, support messaging, and trade request features.",
        ],
      },
      { heading: "No investment advice", body: ["Content on this website is provided for general information and platform presentation only. It should not be treated as personal investment, legal, tax, or financial advice."] },
      { heading: "Account access", body: ["Users are responsible for keeping login information secure. Hutridge Financial may restrict or suspend access where security, compliance, or misuse concerns arise."] },
      { heading: "Indicative data", body: ["Market prices, charts, balances, holdings, and trade request information may be indicative and may differ from executable market prices, third-party data feeds, or final account records."] },
      { heading: "Changes", body: ["Hutridge Financial may update site features, terms, policies, content, or availability at any time. Continued use of the website after changes means acceptance of the updated terms."] },
    ],
  },
  "risk-disclosure": {
    title: "Risk Disclosure",
    updated: "June 10, 2026",
    intro: "Trading foreign exchange, CFDs, commodities, indices, stocks, crypto assets, and other financial products involves significant risk and may not be suitable for all investors.",
    sections: [
      {
        heading: "Trading risk",
        body: [
          "Markets can move rapidly and unpredictably. Price volatility, leverage, liquidity conditions, spreads, execution delays, market gaps, and technical issues can result in substantial losses.",
          "Users should trade only with funds they can afford to lose and should understand the risks of each instrument before placing any trade request.",
        ],
      },
      { heading: "Leverage risk", body: ["Leverage can magnify both profits and losses. Small price movements may have a large impact on account equity, and users may lose more than their initial investment where permitted by applicable terms."] },
      { heading: "Crypto and private market risk", body: ["Crypto assets and private market products can be highly speculative, illiquid, and subject to extreme price changes, regulatory uncertainty, and technology risks."] },
      { heading: "No guarantee", body: ["Past performance does not guarantee future results. No market analysis, portfolio display, or account communication should be interpreted as a promise of returns."] },
    ],
  },
  "aml-policy": {
    title: "AML Policy",
    updated: "June 10, 2026",
    intro: "Hutridge Financial maintains anti-money-laundering controls intended to reduce the risk of misuse of the platform for fraud, sanctions violations, terrorist financing, or other unlawful activity.",
    sections: [
      { heading: "Customer due diligence", body: ["We may request identifying information, account details, source of funds information, transaction context, and supporting documents where needed for onboarding, funding review, or account monitoring."] },
      { heading: "Monitoring", body: ["Account activity, deposit requests, support communications, login behavior, and other platform activity may be reviewed for unusual, suspicious, or inconsistent patterns."] },
      { heading: "Restricted activity", body: ["Users must not use the platform to facilitate fraud, money laundering, sanctions evasion, illegal gambling, unauthorized financial activity, or any transaction involving prohibited parties or jurisdictions."] },
      { heading: "Reporting and records", body: ["Where required or appropriate, suspicious activity may be escalated, reported, or retained in accordance with legal, regulatory, security, and operational obligations."] },
    ],
  },
  "kyc-policy": {
    title: "KYC Policy",
    updated: "June 10, 2026",
    intro: "This KYC Policy describes how Hutridge Financial may verify user identity and account information before providing access to certain account, funding, support, or trading features.",
    sections: [
      { heading: "Verification information", body: ["KYC information may include name, contact details, country of residence, identity documents, address information, funding method details, account type, and trading experience."] },
      { heading: "Review process", body: ["Verification may be automated, manual, or a combination of both. Hutridge Financial may request additional information if submitted details appear incomplete, inconsistent, or high risk."] },
      { heading: "Account restrictions", body: ["Certain features may be delayed, limited, or unavailable until verification requirements are satisfied. Accounts may be declined, suspended, or closed where verification cannot be completed."] },
      { heading: "Accuracy", body: ["Users are responsible for submitting accurate, current, and truthful information. False or misleading information may result in account restriction or termination."] },
    ],
  },
};
