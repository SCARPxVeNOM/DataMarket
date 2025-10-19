// Selective Disclosure: Reveal only specific fields from credentials

export interface FullCredential {
  id: string;
  type: string;
  claims: Record<string, any>;
  issuer: string;
  issuedAt: string;
}

export interface PartialCredential {
  id: string;
  type: string;
  revealedClaims: Record<string, any>;
  hiddenFields: string[];
  proof: string; // Proof that hidden fields exist but are not revealed
}

// Create partially disclosed credential
export function selectiveDisclose(
  credential: FullCredential,
  fieldsToReveal: string[]
): PartialCredential {
  const revealedClaims: Record<string, any> = {};
  const hiddenFields: string[] = [];

  Object.keys(credential.claims).forEach((field) => {
    if (fieldsToReveal.includes(field)) {
      revealedClaims[field] = credential.claims[field];
    } else {
      hiddenFields.push(field);
    }
  });

  // Generate cryptographic proof that hidden fields exist
  const proof = generateDisclosureProof(credential, fieldsToReveal);

  console.log(`🎭 Selective Disclosure for credential ${credential.id}`);
  console.log(`   Revealed: ${Object.keys(revealedClaims).join(", ")}`);
  console.log(`   Hidden: ${hiddenFields.join(", ")}`);

  return {
    id: credential.id,
    type: credential.type,
    revealedClaims,
    hiddenFields,
    proof,
  };
}

// Verify that partial credential is valid
export function verifyPartialCredential(partial: PartialCredential): boolean {
  // In production: Verify cryptographic proof
  // For now, just check structure
  return (
    partial.id !== undefined &&
    partial.proof !== undefined &&
    Object.keys(partial.revealedClaims).length > 0
  );
}

// Example: Seller reveals "verified" status but hides personal info
export function createSellerPreview(fullCredential: FullCredential): PartialCredential {
  // Reveal only trust-related fields, hide personal info
  return selectiveDisclose(fullCredential, [
    "verified",
    "humanhood",
    "trustScore",
    "memberSince",
  ]);
  // Hidden: email, location, realName, phoneNumber, etc.
}

// Example: Dataset preview without revealing raw data
export function createDatasetPreview(fullCredential: FullCredential): PartialCredential {
  return selectiveDisclose(fullCredential, [
    "siteCount",
    "categories",
    "timeRange",
    "verified",
    "consentGiven",
  ]);
  // Hidden: actualURLs, timestamps, userAgent, etc.
}

// Generate cryptographic disclosure proof
function generateDisclosureProof(
  credential: FullCredential,
  revealedFields: string[]
): string {
  // In production: Use Merkle trees or ZK-SNARKs
  // Create commitment to all fields, reveal only some paths
  
  // Mock proof for demonstration
  const allFields = Object.keys(credential.claims).sort();
  const commitment = hashFields(credential.claims);
  const revealedProofs = revealedFields.map((field) =>
    hashField(field, credential.claims[field])
  );

  return JSON.stringify({
    commitment,
    revealedProofs,
    hiddenCount: allFields.length - revealedFields.length,
  });
}

// Helper: Hash fields (in production, use proper cryptographic hash)
function hashFields(claims: Record<string, any>): string {
  const str = JSON.stringify(claims, Object.keys(claims).sort());
  return `0x${Buffer.from(str).toString("hex").slice(0, 64)}`;
}

function hashField(key: string, value: any): string {
  const str = `${key}:${JSON.stringify(value)}`;
  return `0x${Buffer.from(str).toString("hex").slice(0, 32)}`;
}

