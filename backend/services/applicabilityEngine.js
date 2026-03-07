const SCORING_RULES = {
  industry: {
    fintech: { domains: ["Tax", "Security", "Privacy", "Corporate", "Financial"], score: 3, label: "Fintech industry" },
    ecommerce: { domains: ["Tax", "Privacy", "Consumer Protection", "Corporate"], score: 2, label: "E-commerce industry" },
    SaaS: { domains: ["Security", "Privacy", "Corporate"], score: 2, label: "SaaS industry" },
    healthcare: { domains: ["Privacy", "Security", "Health Data", "Corporate"], score: 3, label: "Healthcare industry" },
    manufacturing: { domains: ["Tax", "Labour", "Corporate", "Environmental"], score: 2, label: "Manufacturing industry" },
    consulting: { domains: ["Tax", "Corporate", "Labour"], score: 1, label: "Consulting industry" }
  },

  country: {
    India: { domains: ["Tax", "Labour", "Corporate", "GST"], score: 2, label: "India operations" },
    Singapore: { domains: ["Tax", "Corporate", "PDPA", "Privacy"], score: 2, label: "Singapore operations" },
    USA: { domains: ["Tax", "Labour", "Corporate", "Privacy"], score: 2, label: "USA operations" },
    UK: { domains: ["Tax", "Labour", "Corporate", "GDPR", "Privacy"], score: 2, label: "UK operations" }
  },

  employeeCount: {
    "11-50": { domains: ["Labour", "HR"], score: 1, label: "11-50 employees" },
    "51-200": { domains: ["Labour", "HR", "Governance"], score: 2, label: "51-200 employees" },
    "201-500": { domains: ["Labour", "HR", "Governance", "Compliance"], score: 2, label: "201-500 employees" },
    "500+": { domains: ["Labour", "HR", "Governance", "Compliance", "Risk Management"], score: 3, label: "500+ employees" }
  },

  dataTypes: {
    storesPersonalData: { domains: ["Privacy", "Data Protection"], score: 3, label: "stores personal data" },
    storesFinancialData: { domains: ["Security", "Financial", "Data Protection"], score: 3, label: "stores financial data" },
    storesHealthData: { domains: ["Health Data", "Privacy", "Security", "Data Protection"], score: 3, label: "stores health data" }
  },

  technology: {
    cloudHosted: { domains: ["Security", "IT"], score: 2, label: "cloud hosting" },
    remoteWorkforce: { domains: ["Security", "IT", "HR"], score: 1, label: "remote workforce" }
  },

  business: {
    sellsToEnterprises: { domains: ["Security", "Compliance", "Governance"], score: 2, label: "enterprise sales" },
    taxRegistered: { domains: ["Tax", "GST"], score: 2, label: "tax registered" },
    crossBorderOperations: { domains: ["International Compliance", "Tax"], score: 2, label: "cross-border operations" }
  },

  entityType: {
    "Private Limited": { domains: ["Corporate", "Governance"], score: 2, label: "Private Limited entity" },
    "Public Limited": { domains: ["Corporate", "Governance", "Compliance", "Risk Management"], score: 3, label: "Public Limited entity" },
    "LLP": { domains: ["Corporate", "Tax"], score: 1, label: "LLP entity" },
    "Sole Proprietorship": { domains: ["Tax"], score: 1, label: "Sole Proprietorship" }
  },

  revenue: {
    "$1M-$5M": { domains: ["Finance", "Governance"], score: 2, label: "$1M-$5M revenue" },
    "$5M-$10M": { domains: ["Finance", "Governance", "Risk Management", "Compliance"], score: 2, label: "$5M-$10M revenue" },
    "$10M+": { domains: ["Finance", "Governance", "Risk Management", "Compliance", "Internal Audit"], score: 3, label: "$10M+ revenue" }
  }
};

const FRAMEWORK_MAP = {
  Security: ["SOC2", "ISO27001"],
  Privacy: ["GDPR", "PDPA"],
  Tax: ["GST", "Corporate Tax"],
  Labour: ["Labour Law"],
  Corporate: ["Corporate Filings"],
  Financial: ["Financial Regulations"],
  GST: ["GST"],
  PDPA: ["PDPA"],
  GDPR: ["GDPR"],
  "Data Protection": ["GDPR", "PDPA"],
  "Health Data": ["HIPAA"],
  IT: ["ISO27001"],
  HR: ["Labour Law"],
  Governance: ["Corporate Governance"],
  Compliance: ["SOC2"],
  "Risk Management": ["ISO31000"],
  Finance: ["Financial Regulations"],
  "International Compliance": ["GDPR"],
  "Internal Audit": ["Internal Audit Standards"],
  "Consumer Protection": ["Consumer Protection Act"]
};

const computeApplicabilityMatrix = (profile) => {
  const domainData = {};
  const triggeredRules = [];

  const addDomains = (rule) => {
    rule.domains.forEach(domain => {
      if (!domainData[domain]) {
        domainData[domain] = { score: 0, reasons: [] };
      }
      domainData[domain].score += rule.score;
      if (!domainData[domain].reasons.includes(rule.label)) {
        domainData[domain].reasons.push(rule.label);
      }
    });
  };

  if (profile.industry && SCORING_RULES.industry[profile.industry]) {
    addDomains(SCORING_RULES.industry[profile.industry]);
  }

  if (profile.headquartersCountry && SCORING_RULES.country[profile.headquartersCountry]) {
    addDomains(SCORING_RULES.country[profile.headquartersCountry]);
  }

  if (profile.employeeCountRange && SCORING_RULES.employeeCount[profile.employeeCountRange]) {
    addDomains(SCORING_RULES.employeeCount[profile.employeeCountRange]);
  }

  if (profile.storesPersonalData && SCORING_RULES.dataTypes.storesPersonalData) {
    addDomains(SCORING_RULES.dataTypes.storesPersonalData);
  }

  if (profile.storesFinancialData && SCORING_RULES.dataTypes.storesFinancialData) {
    addDomains(SCORING_RULES.dataTypes.storesFinancialData);
  }

  if (profile.storesHealthData && SCORING_RULES.dataTypes.storesHealthData) {
    addDomains(SCORING_RULES.dataTypes.storesHealthData);
  }

  if (profile.cloudHosted && SCORING_RULES.technology.cloudHosted) {
    addDomains(SCORING_RULES.technology.cloudHosted);
  }

  if (profile.remoteWorkforce && SCORING_RULES.technology.remoteWorkforce) {
    addDomains(SCORING_RULES.technology.remoteWorkforce);
  }

  if (profile.sellsToEnterprises && SCORING_RULES.business.sellsToEnterprises) {
    addDomains(SCORING_RULES.business.sellsToEnterprises);
  }

  if (profile.taxRegistered && SCORING_RULES.business.taxRegistered) {
    addDomains(SCORING_RULES.business.taxRegistered);
  }

  if (profile.countriesOfOperation && profile.countriesOfOperation.length > 1 && SCORING_RULES.business.crossBorderOperations) {
    addDomains(SCORING_RULES.business.crossBorderOperations);
  }

  if (profile.entityType && SCORING_RULES.entityType[profile.entityType]) {
    addDomains(SCORING_RULES.entityType[profile.entityType]);
  }

  if (profile.revenueRange && SCORING_RULES.revenue[profile.revenueRange]) {
    addDomains(SCORING_RULES.revenue[profile.revenueRange]);
  }

  const domains = Object.keys(domainData).map(name => ({
    name,
    score: domainData[name].score,
    reason: domainData[name].reasons.join(" + ")
  })).sort((a, b) => b.score - a.score);

  const frameworkSet = new Set();
  domains.forEach(domain => {
    if (FRAMEWORK_MAP[domain.name]) {
      FRAMEWORK_MAP[domain.name].forEach(fw => frameworkSet.add(fw));
    }
  });

  return {
    domains,
    frameworks: Array.from(frameworkSet)
  };
};

const determineApplicableDomains = (profile) => {
  const result = computeApplicabilityMatrix(profile);
  return result.domains.map(d => d.name);
};

const getDomainNames = (result) => {
  return result.domains.map(d => d.name);
};

module.exports = { 
  determineApplicableDomains,
  computeApplicabilityMatrix,
  getDomainNames
};
