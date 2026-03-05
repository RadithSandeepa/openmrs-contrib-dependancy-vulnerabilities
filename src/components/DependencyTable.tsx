"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import type { CVE } from "@/types/cve";
import type { Dependency } from "@/types/dependency";
import type { Repository } from "@/types/repository";

interface Props {
  repo: Repository;
}

export const DependencyTable = ({ repo }: Props) => {
  const [repoExpanded, setRepoExpanded] = useState(false);
  const [expandedDeps, setExpandedDeps] = useState<Record<string, boolean>>({});
  const [sortField, setSortField] = useState<"severity" | "score" | "name">("severity");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const toggleDep = (depName: string) => {
    setExpandedDeps((prev) => ({ ...prev, [depName]: !prev[depName] }));
  };

  // Map severity to Tailwind classes
  function getSeverityColor(sev?: string) {
        switch (sev) {
        case "Critical":
            return "bg-red-300 text-red-700";
        case "High":
            return "bg-red-200 text-red-500";
        case "Medium":
            return "bg-yellow-200 text-yellow-600";
        case "Low":
            return "bg-green-200 text-green-700";
        default:
            return "bg-gray-300 text-gray-700";
        }
  }

  const severityOrder = ["-", "Low", "Medium", "High", "Critical"];

  const sortedDeps = [...repo.dependencies].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
  
    if (sortField === "severity") {
      const diff =
        severityOrder.indexOf(a.severity || "-") -
        severityOrder.indexOf(b.severity || "-");
      return diff * direction;
    }
  
    if (sortField === "score") {
      const aMax = Math.max(...a.cves.map(c => Number(c.score) || 0));
      const bMax = Math.max(...b.cves.map(c => Number(c.score) || 0));
      return (aMax - bMax) * direction;
    }
  
    return a.name.localeCompare(b.name) * direction;
  });

  return (
    <div className="bg-white mb-4">
      {/* Repository Header */}
      <div
        className="flex items-center justify-between cursor-pointer p-8 border border-gray-200"
        onClick={() => setRepoExpanded(!repoExpanded)}
      >
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-lg text-gray-500">{repo.name}</h2>
          <span
            className={`
                text-xs font-semibold px-4 py-1 rounded-full
                ${getSeverityColor(repo.severity)}
            `}
          >{repo.severity || "-"}
          </span>
        </div>
        {repoExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {/* Dependencies Table */}
      {repoExpanded && (
        <table className="min-w-full border-l border-r border-t border-gray-300">
          <thead className="bg-gray-200 text-sm">
            <tr>
              <th 
                className="py-4 px-8 text-left cursor-pointer flex items-center gap-1"
                onClick={() => {
                  setSortField("name");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Dependency <ArrowUpDown size={14} />
              </th>
              <th className="py-4 px-2 text-left">Version</th>
              <th 
                className="py-4 px-2 text-left cursor-pointer flex items-center gap-1"
                onClick={() => {
                  setSortField("severity");
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                }}
              >
                Severity <ArrowUpDown size={14} />
              </th>
              <th className="py-4 px-2 text-left">CVEs</th>
              <th className="py-4 px-2 text-left">Exploit?</th>
              <th className="py-4 px-2 text-left">Fix Version</th>
            </tr>
          </thead>
          <tbody>
                {sortedDeps.map((dep: Dependency) => {
                const isExpanded = expandedDeps[dep.name];
                return (
                    <>
                    {/* Dependency row */}
                    <tr
                        key={dep.name}
                        className="cursor-pointer hover:bg-gray-50 p-5 text-gray-600 border-b-2 border-gray-100"
                        onClick={() => toggleDep(dep.name)}
                    >
                        <td className="py-4 px-6 flex items-center gap-4 text-gray-600">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {dep.name}
                        </td>
                        <td className="py-4 px-6">{dep.version}</td>
                        <td className="py-4 px-6">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(dep.severity)}`}>
                                {dep.severity || "-"}
                            </span>
                        </td>
                        <td className="py-4 px-6">{dep.cves.length}</td>
                        <td className="py-4 px-6">{dep.exploit ? "Yes" : "-"}</td>
                        <td className="py-4 px-6">{dep.fixVersion || "-"}</td>
                    </tr>

                    {/* CVE rows */}
                    {isExpanded && (
                        <tr>
                            <td colSpan={6} className="px-8 py-4">
                            <table className="w-full text-sm">

                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-4 px-4 text-left">CVE ID</th>
                                    <th className="py-4 px-4 text-left">Severity</th>
                                    <th 
                                      className="py-4 px-4 text-left cursor-pointer flex items-center gap-1"
                                      onClick={() => {
                                        setSortField("score");
                                        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                                      }}
                                    >
                                      Score <ArrowUpDown size={14} />
                                    </th>
                                    <th className="py-4 px-4 text-left">Description</th>
                                    <th className="py-4 px-4 text-left">Affected Versions</th>
                                    <th className="py-4 px-4 text-left">Fixed In</th>
                                    <th className="py-4 px-4 text-left">CWE</th>
                                </tr>
                                </thead>

                                <tbody>
                                {[...dep.cves]
                                .sort((a, b) => (Number(b.score) || 0) - (Number(a.score) || 0))
                                .map((cve: CVE) => (
                                    <tr key={cve.id} className="border-t border-b border-gray-200">
                                    <td className="py-2 px-4">
                                        <span className="text-blue-400 underline cursor-pointer">{cve.id}</span>
                                    </td>

                                    <td className="py-2 px-4">
                                        <span
                                        className={`px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                                            cve.severity
                                        )}`}
                                        >
                                        {cve.severity || "-"}
                                        </span>
                                    </td>

                                    <td className="py-2 px-4">{cve.score ?? "-"}</td>

                                    <td className="py-2 px-4 max-w-md whitespace-normal break-words">
                                        {cve.description || "-"}
                                    </td>
                                    <td className="py-2 px-4">{(cve.affectedVersions ?? []).join(", ") || "-"}</td>
                                    <td className="py-2 px-4">{(cve.fixedIn ?? []).join(", ") || "-"}</td>
                                    <td className="py-2 px-4">{(cve.cwe ?? []).join(", ") || "-"}</td>
                                    </tr>
                                ))}
                                </tbody>

                            </table>
                            </td>
                        </tr>
                    )}
                    </>
                );
                })}
          </tbody>
        </table>
      )}
    </div>
  );
};