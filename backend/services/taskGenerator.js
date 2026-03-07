const ComplianceTask = require("../models/ComplianceTask");
const { determineApplicableDomains } = require("./applicabilityEngine");

const TASK_TEMPLATES = {
  Tax: [
    {
      title: "GST Monthly Filing",
      description: "File GST return for the month.",
      frequency: "Monthly",
      priority: "high",
      dueOffset: { months: 0, day: 20 }
    },
    {
      title: "Annual Tax Return Filing",
      description: "Prepare and file annual income tax return.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 6, day: 31 }
    },
    {
      title: "Quarterly Tax Planning Review",
      description: "Review tax obligations and optimize tax strategy.",
      frequency: "Quarterly",
      priority: "medium",
      dueOffset: { months: 3, day: 15 }
    }
  ],

  Labour: [
    {
      title: "Provident Fund (PF) Filing",
      description: "Monthly PF compliance for employees.",
      frequency: "Monthly",
      priority: "high",
      dueOffset: { months: 0, day: 15 }
    },
    {
      title: "Payroll Compliance Audit",
      description: "Audit payroll processes for compliance.",
      frequency: "Quarterly",
      priority: "medium",
      dueOffset: { months: 3, day: 10 }
    },
    {
      title: "Labour Law Compliance Review",
      description: "Review compliance with labour regulations.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 1 }
    }
  ],

  Security: [
    {
      title: "Security Awareness Training",
      description: "Conduct security awareness training for team.",
      frequency: "Quarterly",
      priority: "medium",
      dueOffset: { months: 3, day: 1 }
    },
    {
      title: "Access Control Review",
      description: "Review and update user access permissions.",
      frequency: "Quarterly",
      priority: "high",
      dueOffset: { months: 3, day: 15 }
    },
    {
      title: "Vulnerability Assessment",
      description: "Conduct security vulnerability assessment.",
      frequency: "Quarterly",
      priority: "high",
      dueOffset: { months: 3, day: 20 }
    },
    {
      title: "Cloud Security Review",
      description: "Review cloud infrastructure security configurations.",
      frequency: "Quarterly",
      priority: "high",
      dueOffset: { months: 3, day: 5 }
    }
  ],

  Privacy: [
    {
      title: "Privacy Policy Review",
      description: "Review data handling and privacy disclosures.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 1 }
    },
    {
      title: "Data Subject Rights Assessment",
      description: "Review processes for handling data subject requests.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Privacy Impact Assessment",
      description: "Conduct privacy impact assessment for new processes.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 15 }
    }
  ],

  Corporate: [
    {
      title: "Annual ROC Filing",
      description: "File annual return with Registrar of Companies.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 8, day: 30 }
    },
    {
      title: "Board Meeting Minutes",
      description: "Document and file board meeting minutes.",
      frequency: "Quarterly",
      priority: "medium",
      dueOffset: { months: 3, day: 1 }
    },
    {
      title: "Annual Registration Verification",
      description: "Verify all business registrations and licenses are current.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 11, day: 31 }
    }
  ],

  Finance: [
    {
      title: "Quarterly Bookkeeping Review",
      description: "Review financial records and reconcile accounts.",
      frequency: "Quarterly",
      priority: "medium",
      dueOffset: { months: 3, day: 15 }
    },
    {
      title: "Internal Audit",
      description: "Conduct internal audit of financial and operational processes.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Financial Controls Review",
      description: "Review and update financial controls and procedures.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 1 }
    }
  ],

  "Data Protection": [
    {
      title: "Data Inventory Update",
      description: "Update inventory of personal data collected and processed.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 1 }
    },
    {
      title: "Data Retention Review",
      description: "Review and enforce data retention policies.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Third-Party Data Processor Audit",
      description: "Audit third-party vendors handling personal data.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 15 }
    }
  ],

  IT: [
    {
      title: "Data Backup Verification",
      description: "Test and verify backup systems are functioning.",
      frequency: "Monthly",
      priority: "high",
      dueOffset: { months: 1, day: 1 }
    },
    {
      title: "Disaster Recovery Test",
      description: "Test disaster recovery and business continuity plans.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 1 }
    },
    {
      title: "IT Asset Management Review",
      description: "Review and update IT asset inventory.",
      frequency: "Quarterly",
      priority: "medium",
      dueOffset: { months: 3, day: 1 }
    }
  ],

  HR: [
    {
      title: "Employee Benefits Review",
      description: "Review employee benefits and compensation structure.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Compliance Training Program",
      description: "Conduct compliance training for all employees.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 15 }
    },
    {
      title: "Employee Handbook Update",
      description: "Review and update employee handbook.",
      frequency: "Yearly",
      priority: "low",
      dueOffset: { months: 12, day: 1 }
    }
  ],

  Governance: [
    {
      title: "Policy Documentation Review",
      description: "Review and update company policies and procedures.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Risk Assessment",
      description: "Conduct comprehensive risk assessment.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Whistleblower Policy Review",
      description: "Review and update whistleblower protection policies.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 1 }
    }
  ],

  Compliance: [
    {
      title: "SOC 2 Readiness Assessment",
      description: "Assess readiness for SOC 2 compliance.",
      frequency: "Yearly",
      priority: "medium",
      dueOffset: { months: 12, day: 1 }
    },
    {
      title: "Compliance Framework Review",
      description: "Review compliance with applicable frameworks.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 1 }
    }
  ],

  Financial: [
    {
      title: "Financial Controls Assessment",
      description: "Assess effectiveness of financial controls.",
      frequency: "Quarterly",
      priority: "high",
      dueOffset: { months: 3, day: 1 }
    },
    {
      title: "Anti-Money Laundering Review",
      description: "Review AML policies and transaction monitoring.",
      frequency: "Quarterly",
      priority: "high",
      dueOffset: { months: 3, day: 15 }
    }
  ],

  GST: [
    {
      title: "GST Reconciliation",
      description: "Reconcile GST input and output records.",
      frequency: "Monthly",
      priority: "high",
      dueOffset: { months: 0, day: 10 }
    }
  ],

  PDPA: [
    {
      title: "PDPA Compliance Review",
      description: "Review compliance with Singapore PDPA requirements.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 1 }
    }
  ],

  GDPR: [
    {
      title: "GDPR Compliance Audit",
      description: "Audit GDPR compliance and data processing activities.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 1 }
    }
  ],

  "International Compliance": [
    {
      title: "Cross-Border Compliance Review",
      description: "Review compliance with international regulations.",
      frequency: "Bi-Annual",
      priority: "high",
      dueOffset: { months: 6, day: 1 }
    }
  ],

  "Risk Management": [
    {
      title: "Enterprise Risk Assessment",
      description: "Conduct enterprise-wide risk assessment.",
      frequency: "Yearly",
      priority: "high",
      dueOffset: { months: 12, day: 1 }
    }
  ],

  "Internal Audit": [
    {
      title: "Internal Controls Testing",
      description: "Test effectiveness of internal controls.",
      frequency: "Quarterly",
      priority: "high",
      dueOffset: { months: 3, day: 1 }
    }
  ]
};

const calculateDueDate = (offset) => {
  const today = new Date();
  const dueDate = new Date(today);
  dueDate.setMonth(dueDate.getMonth() + offset.months);
  dueDate.setDate(offset.day);
  return dueDate;
};

const generateTasksFromProfile = async (profile) => {
  const applicableDomains = determineApplicableDomains(profile);
  const tasks = [];

  applicableDomains.forEach(domain => {
    const templates = TASK_TEMPLATES[domain];
    if (templates) {
      templates.forEach(template => {
        tasks.push({
          orgId: profile.orgId,
          title: template.title,
          description: template.description,
          category: domain,
          frequency: template.frequency,
          dueDate: calculateDueDate(template.dueOffset),
          priority: template.priority,
          status: "pending",
          createdBySystem: true
        });
      });
    }
  });

  if (tasks.length > 0) {
    await ComplianceTask.insertMany(tasks);
  }

  return tasks.length;
};

module.exports = generateTasksFromProfile;
