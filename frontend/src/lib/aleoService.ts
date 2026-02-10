import { PROGRAM_ID, NETWORK_URL } from './aleo';

// Read a mapping value from the Aleo network
async function getMappingValue(mappingName: string, key: string): Promise<string | null> {
  try {
    const url = `${NETWORK_URL}/testnet/program/${PROGRAM_ID}/mapping/${mappingName}/${key}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const text = await response.text();
    const cleaned = text.replace(/"/g, '').trim();
    if (cleaned === 'null' || cleaned === '') return null;
    return cleaned;
  } catch {
    return null;
  }
}

export async function getReportCount(orgHash: string): Promise<number> {
  const value = await getMappingValue('report_count', orgHash);
  if (!value) return 0;
  const match = value.match(/(\d+)u64/);
  return match ? parseInt(match[1]) : 0;
}

export async function getSeveritySum(orgHash: string): Promise<number> {
  const value = await getMappingValue('severity_sum', orgHash);
  if (!value) return 0;
  const match = value.match(/(\d+)u64/);
  return match ? parseInt(match[1]) : 0;
}

export async function getOrgRegistered(orgHash: string): Promise<boolean> {
  const value = await getMappingValue('org_registered', orgHash);
  return value === 'true';
}

export async function getOrgStats(orgHash: string, orgName: string) {
  const [reportCount, severitySum, isRegistered] = await Promise.all([
    getReportCount(orgHash),
    getSeveritySum(orgHash),
    getOrgRegistered(orgHash),
  ]);

  return {
    orgName,
    orgHash,
    reportCount,
    severitySum,
    avgSeverity: reportCount > 0 ? Math.round((severitySum / reportCount) * 10) / 10 : 0,
    isRegistered,
  };
}
