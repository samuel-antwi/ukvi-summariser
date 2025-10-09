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

export interface VisaSummary {
  title: string;
  lastUpdated: string | null;
  sourceUrl: string;
  eligibility: string;
  permittedActivities: string;
  restrictions: string;
  lengthOfStay: string;
  requiredDocuments: string;
  fees: string;
  applicationSteps: string;
  disclaimer: string;
}

export interface SummariseResponse {
  success: boolean;
  data?: VisaSummary;
  error?: string;
}
