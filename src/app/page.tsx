import { DependencyTable } from "@/components/DependencyTable";
import { transformReport } from "@/lib/transformReport";
import coreData from "@/data/openmrs-core.json";
import billingData from "@/data/openmrs-module-billing.json";
import idgenData from "@/data/openmrs-module-idgen.json";

export default function Home() {

  const repos = [
    transformReport(coreData, "openmrs-core"),
    transformReport(billingData, "openmrs-module-billing"),
    transformReport(idgenData, "openmrs-module-idgen"),
  ];

  const severityOrder = ["-", "Low", "Medium", "High", "Critical"];

  repos.sort((a, b) => {
    const sevDiff =
      severityOrder.indexOf(b.severity || "-") -
      severityOrder.indexOf(a.severity || "-");

    if (sevDiff !== 0) return sevDiff;

    const aMaxScore = Math.max(
      ...a.dependencies.flatMap(d => d.cves.map(c => Number(c.score) || 0))
    );

    const bMaxScore = Math.max(
      ...b.dependencies.flatMap(d => d.cves.map(c => Number(c.score) || 0))
    );

    if (bMaxScore !== aMaxScore) return bMaxScore - aMaxScore;

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="p-10 bg-gray-150 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-medium">
        OpenMRS Dependency Vulnerability Report
      </h1>

      {/* green accent */}
      <div className="w-20 h-2 bg-emerald-700 mt-3 mb-6"></div>

      <p className="mb-8">
        A summary of known security vulnerabilities detected across OpenMRS
        modules by automated dependency scanning. Each module lists its
        vulnerable dependencies, severity levels, and recommended fix versions to help maintainers prioritize upgrades.
      </p>

      {/* Repository Tables */}
      <div>
        {repos.map((repo) => (
          <DependencyTable key={repo.name} repo={repo} />
        ))}
      </div>
      
    </div>
  );
}
