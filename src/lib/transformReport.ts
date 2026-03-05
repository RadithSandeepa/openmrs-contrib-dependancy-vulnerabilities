import type { RawReport, RawVulnerability } from "@/types/raw";
import type { Repository } from "@/types/repository";
import type { Dependency } from "@/types/dependency";
import type { CVE } from "@/types/cve";

// Map raw severity string to UI type or "-" if missing
const mapSeverity = (severity?: string): CVE["severity"] => {
  if (!severity) return "-";
  if (["Low", "Medium", "High", "Critical"].includes(severity)) return severity as CVE["severity"];
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

// Updated: take repoName as parameter
export const transformReport = (raw: RawReport, repoName: string): Repository => {
  // Step 1: Group vulnerabilities by dependency
  const depMap: Record<string, Dependency> = {};

  const hasExploit = (cves: CVE[]) =>
    cves.some(cve => cve.links?.some(link => link.name?.includes("EXPLOIT")));

  raw.vulnerabilities.forEach((vuln: RawVulnerability) => {
    const depName = vuln.location.dependency.package.name;
    const depVersion = vuln.location.dependency.version;
    const key = `${depName}@${depVersion}`;

    const cve: CVE = {
      id: vuln.id,
      identifiers: vuln.identifiers,
      description: vuln.description,
      severity: mapSeverity(vuln.severity),
      score: vuln.score ?? "-",
      affectedVersions: [depVersion], // optional
      fixedIn: vuln.fixedIn ?? [],
      cwe: vuln.cwe ?? [],
      links: vuln.links ?? [],
    };

    if (!depMap[key]) {
      depMap[key] = {
        name: depName,
        version: depVersion,
        cves: [cve],
        severity: mapSeverity(vuln.severity),
        fixVersion: (vuln.fixedIn ?? []).sort().reverse()[0] || "-",
        exploit: hasExploit([cve]),
      };
    } else {
      depMap[key].cves.push(cve);
      depMap[key].severity = getMaxSeverity(depMap[key].cves);
      const fixVersions = depMap[key].cves.flatMap(c => c.fixedIn || []);
      depMap[key].fixVersion = fixVersions.sort().reverse()[0] || "-";
      depMap[key].exploit = hasExploit(depMap[key].cves);
    }
  });

  // Step 2: Create repository object
  const dependencies = Object.values(depMap);
  const repoSeverity = getMaxSeverity(dependencies.flatMap(d => d.cves));

  return {
    name: repoName,
    dependencies,
    severity: repoSeverity,
  };
};