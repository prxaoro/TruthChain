// TruthChain - Anonymous Whistleblower Platform
// Prove insider status without revealing identity
// Submit documents that can't be traced back
// Built for Aleo Privacy Buildathon 2026

program whistleblower_v1.aleo {

    // ============================================
    // RECORDS (Private State - Only owner can see)
    // ============================================

    // Insider credential - proves you work at a company
    // WITHOUT revealing which employee you are
    record InsiderCredential {
        owner: address,              // Whistleblower's address
        company_hash: field,         // Hash of company name (e.g., hash("Boeing"))
        department_hash: field,      // Hash of department (e.g., hash("Engineering"))
        seniority_level: u8,         // 1-5 scale (proves experience level)
        credential_id: field,        // Unique credential identifier
        is_verified: bool            // Has been verified by authority
    }

    // Document submission - encrypted leak
    record SecureSubmission {
        owner: address,              // Journalist/investigator who receives
        submission_id: field,        // Unique submission ID
        document_hash: field,        // Hash of encrypted document (stored off-chain)
        insider_proof: field,        // ZK proof of insider status
        company_hash: field,         // Which company this is about
        severity_level: u8,          // 1-5 (how serious)
        bounty_eligible: bool        // Can claim bounty if verified
    }

    // Journalist/Investigator credential
    record JournalistCredential {
        owner: address,              // Journalist's address
        publication_hash: field,     // Hash of publication name
        credential_id: field,        // Unique ID
        trust_score: u64,            // Reputation score
        verified_leaks: u32,         // Number of verified leaks processed
        is_active: bool              // Currently active
    }

    // Bounty reward for verified submissions
    record BountyReward {
        owner: address,              // Whistleblower who earned it
        submission_id: field,        // Which submission
        amount: u64,                 // Reward amount in microcredits
        claimed: bool                // Has been claimed
    }

    // Verification token - proves submission was verified
    record VerificationToken {
        owner: address,              // Whistleblower
        submission_id: field,        // Which submission
        verified_by: field,          // Hash of journalist who verified
        verification_score: u8       // 1-100 credibility score
    }

    // ============================================
    // MAPPINGS (Public State - Aggregated data)
    // ============================================

    // Track total submissions per company (public aggregate)
    mapping company_submission_count: field => u64;

    // Track total verified leaks (public credibility)
    mapping verified_leak_count: field => u64;

    // Bounty pool balance
    mapping bounty_pool: u8 => u64;

    // Journalist reputation scores (public)
    mapping journalist_scores: address => u64;

    // Submission verification status (public - just bool, not content)
    mapping submission_verified: field => bool;

    // Credential registration timestamps (submission_id => block_height)
    mapping credential_timestamps: field => u32;

    // ============================================
    // CONSTRUCTOR
    // ============================================

    @noupgrade
    async constructor() {}

    // ============================================
    // TRANSITIONS (Private Computation)
    // ============================================

    // === INSIDER CREDENTIAL MANAGEMENT ===

    // Register as an insider (self-attestation initially)
    // In production: would integrate with employment verification oracle
    async transition register_insider(
        company_name_hash: field,
        department_hash: field,
        seniority: u8,
        secret_salt: scalar,
        owner_address: address
    ) -> (InsiderCredential, Future) {
        // Validate seniority level
        assert(seniority >= 1u8);
        assert(seniority <= 5u8);

        // Generate unique credential ID using hash
        let credential_id: field = BHP256::hash_to_field(
            BHP256::commit_to_field(company_name_hash, secret_salt)
        );

        // Create the credential record (private to owner)
        let credential: InsiderCredential = InsiderCredential {
            owner: owner_address,
            company_hash: company_name_hash,
            department_hash: department_hash,
            seniority_level: seniority,
            credential_id: credential_id,
            is_verified: false
        };

        return (credential, finalize_register_insider(credential_id));
    }

    async function finalize_register_insider(credential_id: field) {
        // Store timestamp for when credential was created
        Mapping::set(credential_timestamps, credential_id, block.height);
    }

    // Verify insider credential (called by trusted verifier)
    transition verify_insider_credential(
        credential: InsiderCredential
    ) -> InsiderCredential {
        // Create verified version
        let verified_credential: InsiderCredential = InsiderCredential {
            owner: credential.owner,
            company_hash: credential.company_hash,
            department_hash: credential.department_hash,
            seniority_level: credential.seniority_level,
            credential_id: credential.credential_id,
            is_verified: true
        };

        return verified_credential;
    }

    // === DOCUMENT SUBMISSION ===

    // Submit a leak anonymously
    // Proves insider status WITHOUT revealing identity
    async transition submit_leak(
        credential: InsiderCredential,
        document_hash: field,
        severity: u8,
        recipient: address,
        secret_salt: scalar
    ) -> (SecureSubmission, Future) {
        // Validate severity
        assert(severity >= 1u8);
        assert(severity <= 5u8);

        // Generate insider proof - proves they have valid credential
        // WITHOUT revealing which credential
        let insider_proof: field = BHP256::hash_to_field(
            BHP256::commit_to_field(credential.credential_id, secret_salt)
        );

        // Generate unique submission ID
        let submission_id: field = BHP256::hash_to_field(
            BHP256::commit_to_field(document_hash, secret_salt)
        );

        // Create submission record (owned by journalist)
        let submission: SecureSubmission = SecureSubmission {
            owner: recipient,
            submission_id: submission_id,
            document_hash: document_hash,
            insider_proof: insider_proof,
            company_hash: credential.company_hash,
            severity_level: severity,
            bounty_eligible: true
        };

        // Return submission and update public counts
        return (submission, finalize_submit_leak(credential.company_hash, submission_id));
    }

    // Update public submission count and timestamp
    async function finalize_submit_leak(company_hash: field, submission_id: field) {
        // Increment company submission count
        let current_count: u64 = Mapping::get_or_use(
            company_submission_count,
            company_hash,
            0u64
        );
        Mapping::set(company_submission_count, company_hash, current_count + 1u64);

        // Store submission timestamp
        Mapping::set(credential_timestamps, submission_id, block.height);
    }

    // === JOURNALIST MANAGEMENT ===

    // Register as a journalist/investigator
    async transition register_journalist(
        publication_hash: field,
        secret_salt: scalar,
        owner_address: address
    ) -> (JournalistCredential, Future) {
        let credential_id: field = BHP256::hash_to_field(
            BHP256::commit_to_field(publication_hash, secret_salt)
        );

        let credential: JournalistCredential = JournalistCredential {
            owner: owner_address,
            publication_hash: publication_hash,
            credential_id: credential_id,
            trust_score: 100u64,
            verified_leaks: 0u32,
            is_active: true
        };

        return (credential, finalize_register_journalist(owner_address));
    }

    async function finalize_register_journalist(journalist: address) {
        // Initialize journalist score
        Mapping::set(journalist_scores, journalist, 100u64);
    }

    // === VERIFICATION SYSTEM ===

    // Journalist verifies a submission
    async transition verify_submission(
        journalist_cred: JournalistCredential,
        submission: SecureSubmission,
        credibility_score: u8
    ) -> (VerificationToken, JournalistCredential, Future) {
        // Must be active journalist
        assert(journalist_cred.is_active);

        // Credibility score must be valid
        assert(credibility_score >= 1u8);
        assert(credibility_score <= 100u8);

        // Create verification token for whistleblower
        let verification: VerificationToken = VerificationToken {
            owner: submission.owner,
            submission_id: submission.submission_id,
            verified_by: journalist_cred.credential_id,
            verification_score: credibility_score
        };

        // Update journalist's record
        let updated_journalist: JournalistCredential = JournalistCredential {
            owner: journalist_cred.owner,
            publication_hash: journalist_cred.publication_hash,
            credential_id: journalist_cred.credential_id,
            trust_score: journalist_cred.trust_score + 10u64,
            verified_leaks: journalist_cred.verified_leaks + 1u32,
            is_active: journalist_cred.is_active
        };

        return (
            verification,
            updated_journalist,
            finalize_verify(submission.submission_id, submission.company_hash, journalist_cred.owner)
        );
    }

    // Update public verification status
    async function finalize_verify(submission_id: field, company_hash: field, journalist: address) {
        // Mark as verified
        Mapping::set(submission_verified, submission_id, true);

        // Increment verified count for company
        let current_verified: u64 = Mapping::get_or_use(
            verified_leak_count,
            company_hash,
            0u64
        );
        Mapping::set(verified_leak_count, company_hash, current_verified + 1u64);

        // Update journalist score
        let current_score: u64 = Mapping::get_or_use(journalist_scores, journalist, 100u64);
        Mapping::set(journalist_scores, journalist, current_score + 10u64);
    }

    // === BOUNTY SYSTEM ===

    // Fund the bounty pool (anyone can contribute)
    async transition fund_bounty_pool(amount: u64) -> Future {
        assert(amount > 0u64);
        return finalize_fund_bounty(amount);
    }

    async function finalize_fund_bounty(amount: u64) {
        let current_pool: u64 = Mapping::get_or_use(bounty_pool, 0u8, 0u64);
        Mapping::set(bounty_pool, 0u8, current_pool + amount);
    }

    // Create bounty reward for verified submission
    transition create_bounty_reward(
        verification: VerificationToken,
        whistleblower: address,
        amount: u64
    ) -> BountyReward {
        // Only verified submissions can get bounty
        assert(verification.verification_score >= 50u8);

        let reward: BountyReward = BountyReward {
            owner: whistleblower,
            submission_id: verification.submission_id,
            amount: amount,
            claimed: false
        };

        return reward;
    }

    // Claim bounty reward
    async transition claim_bounty(
        reward: BountyReward
    ) -> (BountyReward, Future) {
        // Can't claim twice
        assert(!reward.claimed);

        let claimed_reward: BountyReward = BountyReward {
            owner: reward.owner,
            submission_id: reward.submission_id,
            amount: reward.amount,
            claimed: true
        };

        return (claimed_reward, finalize_claim_bounty(reward.amount));
    }

    async function finalize_claim_bounty(amount: u64) {
        let current_pool: u64 = Mapping::get_or_use(bounty_pool, 0u8, 0u64);
        assert(current_pool >= amount);
        Mapping::set(bounty_pool, 0u8, current_pool - amount);
    }

    // === UTILITY FUNCTIONS ===

    // Prove you're an insider without revealing which one
    // Returns a commitment that can be verified
    transition prove_insider_status(
        credential: InsiderCredential,
        challenge: field
    ) -> field {
        // Generate proof that you hold a valid credential
        // Without revealing the credential details
        let proof: field = BHP256::hash_to_field(
            credential.credential_id + challenge
        );
        return proof;
    }

    // Check if a company has leaks (public query helper)
    transition get_company_hash(company_name: field) -> field {
        return BHP256::hash_to_field(company_name);
    }
}
