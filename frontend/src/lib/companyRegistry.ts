// Company Registry - Track known company hashes in localStorage
// Since Aleo mappings are key-value and not enumerable, we need to track
// company hashes locally to be able to aggregate stats across all companies.

const STORAGE_KEY = 'truthchain_known_companies';

export interface KnownCompany {
  hash: string;
  name?: string; // Optional display name (not stored on-chain)
  addedAt: number;
}

// Get all known companies from localStorage
export function getKnownCompanies(): KnownCompany[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading company registry:', error);
    return [];
  }
}

// Get just the company hashes
export function getKnownCompanyHashes(): string[] {
  return getKnownCompanies().map(c => c.hash);
}

// Add a company to the registry
export function addKnownCompany(hash: string, name?: string): void {
  if (typeof window === 'undefined') return;

  try {
    const companies = getKnownCompanies();

    // Check if already exists
    const exists = companies.some(c => c.hash === hash);
    if (exists) {
      // Update name if provided
      if (name) {
        const updated = companies.map(c =>
          c.hash === hash ? { ...c, name } : c
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return;
    }

    // Add new company
    companies.push({
      hash,
      name,
      addedAt: Date.now(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
  } catch (error) {
    console.error('Error adding company to registry:', error);
  }
}

// Remove a company from the registry
export function removeKnownCompany(hash: string): void {
  if (typeof window === 'undefined') return;

  try {
    const companies = getKnownCompanies();
    const filtered = companies.filter(c => c.hash !== hash);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing company from registry:', error);
  }
}

// Clear all companies
export function clearKnownCompanies(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Get company count
export function getKnownCompanyCount(): number {
  return getKnownCompanies().length;
}
