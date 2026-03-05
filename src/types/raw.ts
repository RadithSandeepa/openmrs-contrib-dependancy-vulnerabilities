export interface RawVulnerability {
    id: string;
    identifiers?: Array<{
      type: string;
      name: string;
      value: string;
      url?: string;
    }>;
    location: {
      file: string;
      dependency: {
        package: {
          name: string;
        };
        version: string;
      };
    };
    name?: string;
    description?: string;
    severity?: "Low" | "Medium" | "High" | "Critical";
    score?: number;
    fixedIn?: string[];
    cwe?: string[];
    links?: Array<{
      name: string;
      url: string;
    }>;
}
  
export interface RawReport {
    version: string;
    schema: string;
    scan: any;
    vulnerabilities: RawVulnerability[];
}