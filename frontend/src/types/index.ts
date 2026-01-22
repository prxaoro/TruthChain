// TruthChain TypeScript Types
// Matching Leo contract records

export interface InsiderCredential {
  owner: string;
  company_hash: string;
  department_hash: string;
  seniority_level: number;
  credential_id: string;
  is_verified: boolean;
}

export interface SecureSubmission {
  owner: string;
  submission_id: string;
  document_hash: string;
  insider_proof: string;
  company_hash: string;
  severity_level: number;
  bounty_eligible: boolean;
}

export interface JournalistCredential {
  owner: string;
  publication_hash: string;
  credential_id: string;
  trust_score: number;
  verified_leaks: number;
  is_active: boolean;
}

export interface BountyReward {
  owner: string;
  submission_id: string;
  amount: number;
  claimed: boolean;
}

export interface VerificationToken {
  owner: string;
  submission_id: string;
  verified_by: string;
  verification_score: number;
}

export type UserRole = 'whistleblower' | 'journalist' | null;

export interface AppState {
  connected: boolean;
  address: string | null;
  role: UserRole;
  credential: InsiderCredential | JournalistCredential | null;
  submissions: SecureSubmission[];
  loading: boolean;
  error: string | null;
}

export interface SubmissionForm {
  company: string;
  department: string;
  severity: number;
  description: string;
  documentHash: string;
  recipientAddress: string;
}

export interface CompanyStats {
  company_hash: string;
  company_name: string;
  submission_count: number;
  verified_count: number;
}
