import { VisaRoute } from '@/types';

export const VISA_ROUTES: VisaRoute[] = [
  {
    id: 'standard-visitor',
    name: 'Standard Visitor',
    path: '/standard-visitor',
  },
  {
    id: 'student-visa',
    name: 'Student Visa',
    path: '/student-visa',
  },
  {
    id: 'skilled-worker-visa',
    name: 'Skilled Worker Visa',
    path: '/skilled-worker-visa',
  },
];

export const GOV_UK_BASE_URL = 'https://www.gov.uk';
export const GOV_UK_API_BASE = 'https://www.gov.uk/api/content';

export const SUMMARY_DISCLAIMER =
  'This is a summary of official guidance and may not capture all nuances. Always read the full GOV.UK page.';
