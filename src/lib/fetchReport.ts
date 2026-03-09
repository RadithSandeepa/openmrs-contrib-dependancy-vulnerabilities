export async function fetchLatestReport(owner: string, repo: string) {
  const headers = {
    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    Accept: "application/vnd.github+json",
  };

  try {
    // Fetch the 10 most recent workflow runs
    const runsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=10`,
      { headers }
    );

    if (!runsRes.ok) {
      console.error(`Failed to fetch runs for ${owner}/${repo}: ${runsRes.status}`);
      return null;
    }

    const runsData = await runsRes.json();
    const runs = runsData.workflow_runs || [];

    if (!runs.length) {
      console.log(`No workflow runs found for ${owner}/${repo}`);
      return null;
    }

    // Loop through runs to find a dependency report artifact
    for (const run of runs) {
      console.log(`Checking run ${run.id} for ${owner}/${repo}`);
      const artifactsRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/actions/runs/${run.id}/artifacts`,
        { headers }
      );

      if (!artifactsRes.ok) {
        console.warn(`Failed to fetch artifacts for run ${run.id}`);
        continue;
      }

      const artifactsData = await artifactsRes.json();
      const artifact = artifactsData.artifacts?.find((a: any) =>
        a.name.toLowerCase().includes("dependency")
      );

      if (artifact) {
        console.log(`Found artifact ${artifact.name} in run ${run.id}`);
        return artifact.archive_download_url;
      }
    }

    console.log(`No dependency report artifact found in recent runs for ${owner}/${repo}`);
    return null;
  } catch (err) {
    console.error(`Error fetching report for ${owner}/${repo}:`, err);
    return null;
  }
}