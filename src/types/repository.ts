import type { Dependency } from "@/types/dependency";

export interface Repository {
  name: string;               
  severity?: "Low" | "Medium" | "High" | "Critical" | "-"; // max severity across dependencies
  dependencies: Dependency[];  // all dependencies for this repo
}