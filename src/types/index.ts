export type VisaRouteId =
  | "standard-visitor"
  | "student-visa"
  | "skilled-worker-visa";

export interface VisaRoute {
  id: VisaRouteId;
  name: string;
  path: string;
}

export interface GovUkContentResponse {
  title: string;
  description?: string;
  details?: {
    body?: string;
    parts?: Array<{
      title: string;
      body: string;
    }>;
  };
  public_updated_at?: string;
  base_path: string;
}

export interface Citation {
  id: string;
  quote: string;
  section: string;
  sectionTitle?: string; // The GOV.UK part/section title (e.g., "Apply for a Standard Visitor visa")
}

export interface VisaSummary {
  title: string;
  lastUpdated: string | null;
  sourceUrl: string;
  basePath: string; // The GOV.UK base path (e.g., '/standard-visitor')
  eligibility: string;
  permittedActivities: string;
  restrictions: string;
  lengthOfStay: string;
  requiredDocuments: string;
  fees: string;
  applicationSteps: string;
  disclaimer: string;
  citations?: Citation[];
}

export interface SummariseResponse {
  success: boolean;
  data?: VisaSummary;
  error?: string;
}

// Eligibility Checker Types
export interface EligibilityQuestion {
  id: string;
  question: string;
  type: 'yes-no' | 'multiple-choice';
  options?: string[]; // For multiple-choice questions
  helpText?: string; // Optional explanation
}

export interface EligibilityAnswer {
  questionId: string;
  answer: string; // "yes", "no", or the selected option
}

export interface EligibilityAssessment {
  eligible: boolean; // true = likely eligible, false = likely not eligible
  confidence: 'high' | 'medium' | 'low';
  summary: string; // Brief explanation of the assessment
  reasons: string[]; // Bullet points explaining why
  nextSteps: string[]; // What the user should do next
  warnings?: string[]; // Important caveats or warnings
  sourceUrl: string; // Link to official guidance
}

export interface EligibilityCheckRequest {
  visaRouteId: VisaRouteId;
  answers: EligibilityAnswer[];
}

export interface EligibilityCheckResponse {
  success: boolean;
  data?: EligibilityAssessment;
  error?: string;
}
