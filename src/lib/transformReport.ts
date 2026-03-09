import type { RawReport } from "@/types/raw";
import type { Repository } from "@/types/repository";
import type { Dependency } from "@/types/dependency";
import type { CVE } from "@/types/cve";

// Map raw severity string to UI type or "-" if missing
const mapSeverity = (severity?: string): CVE["severity"] => {
  if (!severity) return "-";
  if (["Low", "Medium", "High", "Critical"].includes(severity)) return severity as CVE["severity"];
  // Handle "moderate" etc. by mapping to Medium
  if (severity.toLowerCase() === "moderate") return "Medium";
  if (severity.toLowerCase() === "low") return "Low";
  if (severity.toLowerCase() === "high") return "High";
  return "-";
};

// Compute highest severity from CVE array
const getMaxSeverity = (cves: CVE[]): CVE["severity"] => {
  const order: CVE["severity"][] = ["-", "Low", "Medium", "High", "Critical"];
  return cves.reduce<CVE["severity"]>((max, cve) => {
    const severity = cve.severity || "-";
    return order.indexOf(severity) > order.indexOf(max) ? severity : max;
  }, "-");
};

export const transformReport = (raw: RawReport, repoName: string): Repository => {
  const dependencies: Dependency[] = raw.dependencies.map(dep => {
    // Map each raw vulnerability inside this dependency to CVE
    const cves: CVE[] = (dep.vulnerabilities ?? []).map(vuln => ({
      id: vuln.name, // use name as ID
      description: vuln.description,
      severity: mapSeverity(vuln.severity ?? vuln.cvssv3?.baseSeverity),
      score: vuln.cvssv3?.baseScore ?? "-",
      cwe: vuln.cwes ?? [],
      fixedIn: [], // new data may have no fixed versions field
      affectedVersions: [dep.fileName], // approximate
      links: (vuln.references ?? []).map(r => ({ name: r.name, url: r.url })),
      identifiers: [], // optional, can add later if needed
    }));

    const depSeverity = getMaxSeverity(cves);
    const hasExploit = cves.some(c => c.links?.some(l => l.name?.includes("EXPLOIT")));

    return {
      name: dep.fileName,
      version: dep.fileName.split(":")[1] ?? "-", // crude parse for UI
      cves,
      severity: depSeverity,
      fixVersion: "-", // not available in this data
      exploit: hasExploit,
    };
  });

  const repoSeverity = getMaxSeverity(dependencies.flatMap(d => d.cves));

  return {
    name: repoName,
    dependencies,
    severity: repoSeverity,
  };
};