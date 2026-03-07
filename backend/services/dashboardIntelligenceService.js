const calculateComplianceHealth = (tasks) => {
  if (!tasks || tasks.length === 0) return 100;

  const today = new Date();
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const overdueTasks = tasks.filter(t => t.status === "pending" && new Date(t.dueDate) < today).length;
  const dueSoonTasks = tasks.filter(t => {
    const daysLeft = Math.ceil((new Date(t.dueDate) - today) / (1000 * 60 * 60 * 24));
    return t.status === "pending" && daysLeft >= 0 && daysLeft <= 7;
  }).length;

  const completionRatio = completedTasks / totalTasks;
  const overduePenalty = overdueTasks * 2;
  const dueSoonPenalty = dueSoonTasks * 1;

  const score = Math.max(0, Math.round(completionRatio * 100 - overduePenalty - dueSoonPenalty));
  return score;
};

const generateApplicabilitySummary = (profile, applicabilityResult) => {
  if (!profile) return "Complete your business profile to see compliance requirements.";

  const drivers = [];

  if (profile.industry) {
    drivers.push(`${profile.industry} industry`);
  }

  if (profile.countriesOfOperation && profile.countriesOfOperation.length > 1) {
    drivers.push("cross-border operations");
  }

  if (profile.cloudHosted) {
    drivers.push("cloud hosting");
  }

  if (profile.storesFinancialData) {
    drivers.push("handling of financial data");
  }

  if (profile.storesPersonalData) {
    drivers.push("handling of personal data");
  }

  if (profile.storesHealthData) {
    drivers.push("handling of health data");
  }

  if (profile.employeeCountRange && ["51-200", "201-500", "500+"].includes(profile.employeeCountRange)) {
    drivers.push(`${profile.employeeCountRange} employees`);
  }

  if (profile.sellsToEnterprises) {
    drivers.push("enterprise sales");
  }

  if (drivers.length === 0) {
    return "Your company has standard compliance requirements based on your business profile.";
  }

  const driverText = drivers.join(", ");
  return `Your company operates in a ${drivers.length > 2 ? "high" : "moderate"}-regulation environment due to ${driverText}.`;
};

const getTopRiskDomains = (applicabilityResult) => {
  if (!applicabilityResult || !applicabilityResult.domains) return [];

  return applicabilityResult.domains
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(d => ({ name: d.name, score: d.score }));
};

module.exports = {
  calculateComplianceHealth,
  generateApplicabilitySummary,
  getTopRiskDomains
};
