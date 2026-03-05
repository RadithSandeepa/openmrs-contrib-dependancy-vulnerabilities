import type { CVE } from "@/types/cve";

export interface Dependency {
  name: string;          // e.g., com.itextpdf:barcodes
  version: string;       // e.g., 8.0.2
  severity?: "Low" | "Medium" | "High" | "Critical" | "-"; // max severity of CVEs
  fixVersion?: string;   // highest version that fixes all CVEs, or "-"
  cves: CVE[];           // all CVEs affecting this dependency
  exploit?: boolean; 
}