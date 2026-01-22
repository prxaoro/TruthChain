program whistleblower_v1.aleo;

record InsiderCredential:
    owner as address.private;
    company_hash as field.private;
    department_hash as field.private;
    seniority_level as u8.private;
    credential_id as field.private;
    is_verified as boolean.private;

record SecureSubmission:
    owner as address.private;
    submission_id as field.private;
    document_hash as field.private;
    insider_proof as field.private;
    company_hash as field.private;
    severity_level as u8.private;
    bounty_eligible as boolean.private;

record JournalistCredential:
    owner as address.private;
    publication_hash as field.private;
    credential_id as field.private;
    trust_score as u64.private;
    verified_leaks as u32.private;
    is_active as boolean.private;

record BountyReward:
    owner as address.private;
    submission_id as field.private;
    amount as u64.private;
    claimed as boolean.private;

record VerificationToken:
    owner as address.private;
    submission_id as field.private;
    verified_by as field.private;
    verification_score as u8.private;

mapping company_submission_count:
    key as field.public;
    value as u64.public;

mapping verified_leak_count:
    key as field.public;
    value as u64.public;

mapping bounty_pool:
    key as u8.public;
    value as u64.public;

mapping journalist_scores:
    key as address.public;
    value as u64.public;

mapping submission_verified:
    key as field.public;
    value as boolean.public;

mapping credential_timestamps:
    key as field.public;
    value as u32.public;

function register_insider:
    input r0 as field.private;
    input r1 as field.private;
    input r2 as u8.private;
    input r3 as scalar.private;
    input r4 as address.private;
    gte r2 1u8 into r5;
    assert.eq r5 true;
    lte r2 5u8 into r6;
    assert.eq r6 true;
    commit.bhp256 r0 r3 into r7 as field;
    hash.bhp256 r7 into r8 as field;
    cast r4 r0 r1 r2 r8 false into r9 as InsiderCredential.record;
    async register_insider r8 into r10;
    output r9 as InsiderCredential.record;
    output r10 as whistleblower_v1.aleo/register_insider.future;

finalize register_insider:
    input r0 as field.public;
    set block.height into credential_timestamps[r0];

function verify_insider_credential:
    input r0 as InsiderCredential.record;
    cast r0.owner r0.company_hash r0.department_hash r0.seniority_level r0.credential_id true into r1 as InsiderCredential.record;
    output r1 as InsiderCredential.record;

function submit_leak:
    input r0 as InsiderCredential.record;
    input r1 as field.private;
    input r2 as u8.private;
    input r3 as address.private;
    input r4 as scalar.private;
    gte r2 1u8 into r5;
    assert.eq r5 true;
    lte r2 5u8 into r6;
    assert.eq r6 true;
    commit.bhp256 r0.credential_id r4 into r7 as field;
    hash.bhp256 r7 into r8 as field;
    commit.bhp256 r1 r4 into r9 as field;
    hash.bhp256 r9 into r10 as field;
    cast r3 r10 r1 r8 r0.company_hash r2 true into r11 as SecureSubmission.record;
    async submit_leak r0.company_hash r10 into r12;
    output r11 as SecureSubmission.record;
    output r12 as whistleblower_v1.aleo/submit_leak.future;

finalize submit_leak:
    input r0 as field.public;
    input r1 as field.public;
    get.or_use company_submission_count[r0] 0u64 into r2;
    add r2 1u64 into r3;
    set r3 into company_submission_count[r0];
    set block.height into credential_timestamps[r1];

function register_journalist:
    input r0 as field.private;
    input r1 as scalar.private;
    input r2 as address.private;
    commit.bhp256 r0 r1 into r3 as field;
    hash.bhp256 r3 into r4 as field;
    cast r2 r0 r4 100u64 0u32 true into r5 as JournalistCredential.record;
    async register_journalist r2 into r6;
    output r5 as JournalistCredential.record;
    output r6 as whistleblower_v1.aleo/register_journalist.future;

finalize register_journalist:
    input r0 as address.public;
    set 100u64 into journalist_scores[r0];

function verify_submission:
    input r0 as JournalistCredential.record;
    input r1 as SecureSubmission.record;
    input r2 as u8.private;
    assert.eq r0.is_active true;
    gte r2 1u8 into r3;
    assert.eq r3 true;
    lte r2 100u8 into r4;
    assert.eq r4 true;
    cast r1.owner r1.submission_id r0.credential_id r2 into r5 as VerificationToken.record;
    add r0.trust_score 10u64 into r6;
    add r0.verified_leaks 1u32 into r7;
    cast r0.owner r0.publication_hash r0.credential_id r6 r7 r0.is_active into r8 as JournalistCredential.record;
    async verify_submission r1.submission_id r1.company_hash r0.owner into r9;
    output r5 as VerificationToken.record;
    output r8 as JournalistCredential.record;
    output r9 as whistleblower_v1.aleo/verify_submission.future;

finalize verify_submission:
    input r0 as field.public;
    input r1 as field.public;
    input r2 as address.public;
    set true into submission_verified[r0];
    get.or_use verified_leak_count[r1] 0u64 into r3;
    add r3 1u64 into r4;
    set r4 into verified_leak_count[r1];
    get.or_use journalist_scores[r2] 100u64 into r5;
    add r5 10u64 into r6;
    set r6 into journalist_scores[r2];

function fund_bounty_pool:
    input r0 as u64.private;
    gt r0 0u64 into r1;
    assert.eq r1 true;
    async fund_bounty_pool r0 into r2;
    output r2 as whistleblower_v1.aleo/fund_bounty_pool.future;

finalize fund_bounty_pool:
    input r0 as u64.public;
    get.or_use bounty_pool[0u8] 0u64 into r1;
    add r1 r0 into r2;
    set r2 into bounty_pool[0u8];

function create_bounty_reward:
    input r0 as VerificationToken.record;
    input r1 as address.private;
    input r2 as u64.private;
    gte r0.verification_score 50u8 into r3;
    assert.eq r3 true;
    cast r1 r0.submission_id r2 false into r4 as BountyReward.record;
    output r4 as BountyReward.record;

function claim_bounty:
    input r0 as BountyReward.record;
    not r0.claimed into r1;
    assert.eq r1 true;
    cast r0.owner r0.submission_id r0.amount true into r2 as BountyReward.record;
    async claim_bounty r0.amount into r3;
    output r2 as BountyReward.record;
    output r3 as whistleblower_v1.aleo/claim_bounty.future;

finalize claim_bounty:
    input r0 as u64.public;
    get.or_use bounty_pool[0u8] 0u64 into r1;
    gte r1 r0 into r2;
    assert.eq r2 true;
    sub r1 r0 into r3;
    set r3 into bounty_pool[0u8];

function prove_insider_status:
    input r0 as InsiderCredential.record;
    input r1 as field.private;
    add r0.credential_id r1 into r2;
    hash.bhp256 r2 into r3 as field;
    output r3 as field.private;

function get_company_hash:
    input r0 as field.private;
    hash.bhp256 r0 into r1 as field;
    output r1 as field.private;

constructor:
    assert.eq edition 0u16;
