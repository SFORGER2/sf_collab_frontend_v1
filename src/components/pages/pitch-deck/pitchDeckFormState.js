export const initialFormState = {
  template: 'general',
  company_name: '',
  tagline: '',
  founder_name: '',
  problem: '',
  solution: '',
  market_size: '',
  product_description: '',
  key_features: ['', '', ''],
  traction: '',
  team_members: [{ name: '', role: '' }],
  funding_ask: '',
  use_of_funds: '',
};

// Max constraints

export const MAX_TEAM_MEMBERS = 4;

// Template options 

export const TEMPLATES = [
  {
    value: 'general',
    name: 'Midnight Executive',
    description: 'Classic navy palette. Works for any industry.',
    swatches: ['#1E2761', '#F5A623', '#CADCFC'],
  },
  {
    value: 'saas',
    name: 'Tech Modern',
    description: 'Deep purple + electric blue. Built for software & tech.',
    swatches: ['#2D1B69', '#4FC3F7', '#FFFFFF'],
  },
  {
    value: 'fintech',
    name: 'Forest Trust',
    description: 'Dark green + gold + slate. Signals credibility for finance.',
    swatches: ['#1B3A2D', '#C9A84C', '#2E4057'],
  },
  {
    value: 'consumer',
    name: 'Coral Energy',
    description: 'Bold coral + warm white. Made for consumer apps & D2C.',
    swatches: ['#F96167', '#1A1A2E', '#FFF8F0'],
  },
];


export const TEMPLATE_COLORS = {
  general: { bg: '#1E2761', text: '#F5A623' },
  saas: { bg: '#2D1B69', text: '#4FC3F7' },
  fintech: { bg: '#1B3A2D', text: '#C9A84C' },
  consumer: { bg: '#1A1A2E', text: '#F96167' },
};

export const TEMPLATE_LABELS = {
  general: 'Midnight Executive',
  saas: 'Tech Modern',
  fintech: 'Forest Trust',
  consumer: 'Coral Energy',
};

// Validation
export function validate(formData) {
  const errors = {};

  if (!formData.company_name?.trim()) {
    errors.company_name = 'Company name is required';
  }

  if (!formData.problem?.trim()) {
    errors.problem = 'Problem statement is required';
  }

  if (!formData.solution?.trim()) {
    errors.solution = 'Solution is required';
  }

  return errors;
}

// Step-by-step validation
export function validateStep(step, formData) {
  const errors = {};

  if (step === 2) {
    if (!formData.company_name?.trim()) {
      errors.company_name = 'Company name is required';
    }
  }

  if (step === 3) {
    if (!formData.problem?.trim()) {
      errors.problem = 'Problem statement is required';
    }
    if (!formData.solution?.trim()) {
      errors.solution = 'Solution is required';
    }
  }

  return errors;
}

// API cleanup
export function cleanFormData(formData) {
  return {
    ...formData,
    // Only send non-empty feature strings
    key_features: formData.key_features.filter((f) => f.trim() !== ''),
    // Only send team members with a non-empty name; cap at 4
    team_members: formData.team_members
      .filter((m) => m.name.trim() !== '')
      .slice(0, MAX_TEAM_MEMBERS),
  };
}
