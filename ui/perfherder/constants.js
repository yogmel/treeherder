export const tValueCareMin = 3; // Anything below this is "low" in confidence
export const tValueConfidence = 5; // Anything above this is "high" in confidence

// Backend server endpoints
export const endpoints = {
  issueTrackers: '/performance/issue-tracker/',
  frameworks: '/performance/framework/',
  alertSummary: '/performance/alertsummary/',
};

export const noiseMetricTitle = 'noise metric';

export const filterText = {
  showImportant: 'Show only important changes',
  hideUncertain: 'Hide uncertain results',
  showNoise: 'Show only noise',
  hideUncomparable: 'Hide uncomparable results',
  inputPlaceholder: 'linux tp5o',
};

export const alertSummaryStatus = [
  { id: 0, text: 'untriaged' },
  { id: 1, text: 'downstream' },
  { id: 2, text: 'reassigned' },
  { id: 3, text: 'invalid' },
  { id: 4, text: 'improvement' },
  { id: 5, text: 'investigating' },
  { id: 6, text: 'wontfix' },
  { id: 7, text: 'fixed' },
  { id: 8, text: 'backedout' },
  { id: 9, text: 'confirming' },
];
