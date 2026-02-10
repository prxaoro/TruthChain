// TruthChain v2 — Anonymous Whistleblowing on Aleo
// Privacy model: Records for ALL private data, mappings for aggregate-only counters.
// No private data ever enters finalize scope.

program truthchain_v2.aleo {

    // ──────────────────────────────────────────────
    // RECORDS (Private — only the owner can see)
    // ──────────────────────────────────────────────

    record InsiderCredential {
        owner: address,
        org_hash: field,
        role_hash: field,
        credential_id: field,
    }

    record Report {
        owner: address,
        report_hash: field,
        org_hash: field,
        severity: u8,
        report_id: field,
    }

    // ──────────────────────────────────────────────
    // MAPPINGS (Public — aggregate counters only)
    // ──────────────────────────────────────────────

    mapping report_count: field => u64;
    mapping severity_sum: field => u64;
    mapping org_registered: field => bool;

    // ──────────────────────────────────────────────
    // CONSTRUCTOR (required for deployment)
    // ──────────────────────────────────────────────

    @noupgrade
    async constructor() {}

    // ──────────────────────────────────────────────
    // TRANSITIONS
    // ──────────────────────────────────────────────

    // 1. Register as an insider — returns a private credential.
    //    Only the caller receives the record. Nobody else can see it.
    //    The finalize step marks that this org has at least one insider (aggregate only).
    async transition register_insider(
        org_hash: field,
        role_hash: field,
        credential_id: field,
    ) -> (InsiderCredential, Future) {
        let credential: InsiderCredential = InsiderCredential {
            owner: self.caller,
            org_hash: org_hash,
            role_hash: role_hash,
            credential_id: credential_id,
        };
        return (credential, finalize_register(org_hash));
    }

    async function finalize_register(org_hash: field) {
        Mapping::set(org_registered, org_hash, true);
    }

    // 2. Submit an anonymous report.
    //    Consumes the insider credential (proves insider status),
    //    creates a Report record, and re-issues the credential.
    //    Only aggregate data (org_hash, severity) goes into finalize.
    async transition submit_report(
        credential: InsiderCredential,
        report_hash: field,
        severity: u8,
        report_id: field,
    ) -> (Report, InsiderCredential, Future) {
        // Only the credential owner can submit
        assert_eq(credential.owner, self.caller);

        // Severity must be 1-5
        assert(severity >= 1u8);
        assert(severity <= 5u8);

        // Create private report record
        let report: Report = Report {
            owner: self.caller,
            report_hash: report_hash,
            org_hash: credential.org_hash,
            severity: severity,
            report_id: report_id,
        };

        // Re-issue credential (consume + create new — standard UTXO pattern)
        let new_credential: InsiderCredential = InsiderCredential {
            owner: self.caller,
            org_hash: credential.org_hash,
            role_hash: credential.role_hash,
            credential_id: credential.credential_id,
        };

        // Cast severity to u64 for the aggregate sum
        let sev_u64: u64 = severity as u64;

        return (report, new_credential, finalize_submit(credential.org_hash, sev_u64));
    }

    async function finalize_submit(org_hash: field, severity: u64) {
        // Increment report count for this org
        let count: u64 = Mapping::get_or_use(report_count, org_hash, 0u64);
        Mapping::set(report_count, org_hash, count + 1u64);

        // Add severity to running total (avg = severity_sum / report_count)
        let total_sev: u64 = Mapping::get_or_use(severity_sum, org_hash, 0u64);
        Mapping::set(severity_sum, org_hash, total_sev + severity);
    }

    // 3. Verify credential — proves insider status by consuming and re-issuing.
    //    No finalize needed (no public state change).
    transition verify_credential(
        credential: InsiderCredential,
    ) -> InsiderCredential {
        // Only the owner can verify their own credential
        assert_eq(credential.owner, self.caller);

        return InsiderCredential {
            owner: self.caller,
            org_hash: credential.org_hash,
            role_hash: credential.role_hash,
            credential_id: credential.credential_id,
        };
    }
}
