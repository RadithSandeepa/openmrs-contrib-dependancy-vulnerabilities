export interface CVE {
    id: string;                    // CVE-2023-6298
    identifiers?: Array<{          // Optional list of identifiers
      type: string;
      name: string;
      value: string;
      url?: string;
    }>;
    description?: string;
    severity?: "Low" | "Medium" | "High" | "Critical" | "-";
    score?: number | "-";          // may not exist
    affectedVersions?: string[];   // optional
    fixedIn?: string[];            // optional
    cwe?: string[];                // optional
    links?: Array<{
      name: string;
      url: string;
    }>;
}