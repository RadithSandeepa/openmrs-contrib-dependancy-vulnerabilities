export interface RawVulnerability {
  source: string;           // e.g., "NPM"
  name: string;             // e.g., "GHSA-v88g-cgmw-v5xw"
  unscored?: string;        // optional
  severity?: string;        // "moderate", "high", etc.
  cvssv3?: {
    baseScore: number;
    attackVector?: string;
    attackComplexity?: string;
    privilegesRequired?: string;
    userInteraction?: string;
    scope?: string;
    confidentialityImpact?: string;
    integrityImpact?: string;
    availabilityImpact?: string;
    baseSeverity?: string;
    version?: string;
  };
  cwes?: string[];
  description?: string;
  notes?: string;
  references?: Array<{ name: string; url: string; source?: string }>;
  vulnerableSoftware?: Array<{ software: { id: string } }>;
}

export interface RawDependency {
  isVirtual: boolean;
  fileName: string;
  filePath: string;
  projectReferences?: string[];
  evidenceCollected?: {
    vendorEvidence?: Array<{ type: string; confidence: string; source: string; name: string; value: string }>;
    productEvidence?: Array<{ type: string; confidence: string; source: string; name: string; value: string }>;
    versionEvidence?: Array<{ type: string; confidence: string; source: string; name: string; value: string }>;
  };
  packages?: Array<{ id: string; confidence: string }>;
  vulnerabilities?: RawVulnerability[];
}

export interface RawReport {
  reportSchema: string;
  scanInfo?: any;
  projectInfo?: any;
  dependencies: RawDependency[];
}