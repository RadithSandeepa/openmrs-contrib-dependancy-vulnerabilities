import { DependencyTable } from "@/components/DependencyTable";
import { transformReport } from "@/lib/transformReport";
import { monitoredRepos } from "@/lib/repos";
import { fetchLatestReport } from "@/lib/fetchReport";
import JSZip from "jszip";

export default async function Home() {

  const severityOrder = ["-", "Low", "Medium", "High", "Critical"];

  const repos = await Promise.all(
    monitoredRepos.map(async ({ owner, repo }) => {
      console.log(`\n----- Checking ${owner}/${repo} -----`);

      try {
        const artifactUrl = await fetchLatestReport(owner, repo);
        console.log("artifactUrl:", artifactUrl);

        if (!artifactUrl) {
          console.log("No artifact found");
          return null;
        }

        const zipRes = await fetch(artifactUrl, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          },
        });

        console.log("artifact download status:", zipRes.status);

        if (!zipRes.ok) {
          console.log("Failed to download artifact");
          return null;
        }

        const buffer = await zipRes.arrayBuffer();
        console.log("artifact size:", buffer.byteLength);

        const zip = await JSZip.loadAsync(buffer);
        console.log("zip files:", Object.keys(zip.files));

        const reportFile =
          zip.file("dependency-check-report.json") ||
          Object.values(zip.files).find((f) =>
            f.name.endsWith(".json")
          );

          if (!reportFile) {
            console.log("No JSON report found in artifact");
            return null;
          }

          console.log("Found report file:", reportFile.name);

          const raw = JSON.parse(await reportFile.async("string"));
          console.log("Parsed report JSON");

          const transformed = transformReport(raw, repo);

          console.log("transformReport complete");

          return transformed;

      } catch (err) {
          console.error(`Failed loading ${repo}`, err);
          return null;
      }
    })
  );

  const validRepos = repos.filter(Boolean);

  validRepos.sort((a: any, b: any) => {
    const sevDiff =
      severityOrder.indexOf(b.severity || "-") -
      severityOrder.indexOf(a.severity || "-");

    if (sevDiff !== 0) return sevDiff;

    const aMaxScore = Math.max(
      ...a.dependencies.flatMap((d: any) =>
        d.cves.map((c: any) => Number(c.score) || 0)
      )
    );

    const bMaxScore = Math.max(
      ...b.dependencies.flatMap((d: any) =>
        d.cves.map((c: any) => Number(c.score) || 0)
      )
    );

    if (bMaxScore !== aMaxScore) return bMaxScore - aMaxScore;

    return a.name.localeCompare(b.name);
  });

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
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
        {validRepos.map((repo: any) => (
            <DependencyTable key={repo.name} repo={repo} />
        ))}
      </div>
      
    </div>
  );
}
