export interface InsiderCredential {
  owner: string;
  org_hash: string;
  role_hash: string;
  credential_id: string;
  _nonce?: string;
}

export interface Report {
  owner: string;
  report_hash: string;
  org_hash: string;
  severity: string;
  report_id: string;
  _nonce?: string;
}

export interface OrgStats {
  orgName: string;
  orgHash: string;
  reportCount: number;
  severitySum: number;
  avgSeverity: number;
  isRegistered: boolean;
}

export type TxStatus = 'idle' | 'signing' | 'proving' | 'broadcasting' | 'confirmed' | 'failed';
