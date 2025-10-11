import { EligibilityQuestion, VisaRouteId } from '@/types';

/**
 * Eligibility question sets for each visa route
 * These questions help determine if a user is likely eligible for a visa
 */

const STANDARD_VISITOR_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'sv_purpose',
    question: 'What is your main purpose for visiting the UK?',
    type: 'multiple-choice',
    options: [
      'Tourism/holiday',
      'Visiting family or friends',
      'Business meetings or conferences',
      'Short-term study (up to 6 months)',
      'Medical treatment',
      'Other',
    ],
    helpText: 'Standard Visitor visas cover various short-term visit purposes',
  },
  {
    id: 'sv_duration',
    question: 'How long do you plan to stay in the UK?',
    type: 'multiple-choice',
    options: [
      'Less than 6 months',
      '6 months',
      'More than 6 months',
    ],
    helpText: 'Standard Visitor visas are typically valid for up to 6 months',
  },
  {
    id: 'sv_work',
    question: 'Will you be working or seeking work in the UK?',
    type: 'yes-no',
    helpText: 'You cannot work on a Standard Visitor visa (with very limited exceptions)',
  },
  {
    id: 'sv_funds',
    question: 'Can you support yourself financially during your visit without working or accessing public funds?',
    type: 'yes-no',
    helpText: 'You must show you can cover all costs of your trip',
  },
  {
    id: 'sv_return',
    question: 'Do you intend to leave the UK at the end of your visit?',
    type: 'yes-no',
    helpText: 'You must not intend to live in the UK long-term through frequent visits',
  },
];

const STUDENT_VISA_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'st_offer',
    question: 'Have you been accepted onto a course by a licensed Student sponsor?',
    type: 'yes-no',
    helpText: 'You must have a Confirmation of Acceptance for Studies (CAS) from a licensed sponsor',
  },
  {
    id: 'st_level',
    question: 'What level is your course?',
    type: 'multiple-choice',
    options: [
      'Degree level or above (RQF level 6+)',
      'Below degree level (RQF level 3-5)',
      'Pre-sessional English language course',
      'Not sure',
    ],
    helpText: 'Different requirements apply depending on the course level',
  },
  {
    id: 'st_english',
    question: 'Can you prove your knowledge of English?',
    type: 'yes-no',
    helpText: 'You must meet English language requirements (unless exempt)',
  },
  {
    id: 'st_funds',
    question: 'Can you show evidence of sufficient funds to support yourself?',
    type: 'yes-no',
    helpText: 'You need to prove you can cover course fees and living costs',
  },
  {
    id: 'st_age',
    question: 'Are you 16 years old or over?',
    type: 'yes-no',
    helpText: 'You must be at least 16 to apply for a Student visa (under 18s may need parent/guardian consent)',
  },
];

const SKILLED_WORKER_QUESTIONS: EligibilityQuestion[] = [
  {
    id: 'sw_sponsor',
    question: 'Has a UK employer offered you a job and agreed to sponsor you?',
    type: 'yes-no',
    helpText: 'You must have a job offer from a Home Office licensed sponsor',
  },
  {
    id: 'sw_certificate',
    question: 'Has your employer provided you with a Certificate of Sponsorship?',
    type: 'yes-no',
    helpText: 'You need a valid Certificate of Sponsorship reference number',
  },
  {
    id: 'sw_occupation',
    question: 'Is your job on the list of eligible occupations?',
    type: 'multiple-choice',
    options: [
      'Yes, I have checked and it is eligible',
      'Not sure',
      'No, it is not on the list',
    ],
    helpText: 'Your job must be on the list of eligible occupations for Skilled Worker visa',
  },
  {
    id: 'sw_salary',
    question: 'Will you be paid at least £38,700 per year (or the "going rate" for your job, whichever is higher)?',
    type: 'multiple-choice',
    options: [
      'Yes, at least £38,700 per year',
      'Less than £38,700 but I may qualify for reduced salary requirements',
      'Not sure',
      'No',
    ],
    helpText: 'There are minimum salary thresholds, though some exceptions apply',
  },
  {
    id: 'sw_english',
    question: 'Can you speak, read, write, and understand English to at least level B1 on the CEFR scale?',
    type: 'yes-no',
    helpText: 'You must prove your knowledge of English (unless exempt)',
  },
];

/**
 * Gets the eligibility questions for a specific visa route
 */
export function getEligibilityQuestions(
  visaRouteId: VisaRouteId
): EligibilityQuestion[] {
  switch (visaRouteId) {
    case 'standard-visitor':
      return STANDARD_VISITOR_QUESTIONS;
    case 'student-visa':
      return STUDENT_VISA_QUESTIONS;
    case 'skilled-worker-visa':
      return SKILLED_WORKER_QUESTIONS;
    default:
      return [];
  }
}
