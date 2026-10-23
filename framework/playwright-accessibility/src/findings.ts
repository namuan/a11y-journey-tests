type AxeNode = {
  target: string[];
  failureSummary: string | null;
};

type AxeViolation = {
  id: string;
  impact: string | null;
  help: string;
  nodes: AxeNode[];
};

type AxeResults = {
  violations: AxeViolation[];
};

export type NormalizedAccessibilityFinding = {
  ruleId: string;
  impact: string | null;
  summary: string;
  target: string[];
  failureSummary: string | null;
  pageUrl: string;
  state?: string;
};

export function normalizeAccessibilityFindings(
  results: AxeResults,
  metadata: { pageUrl: string; state?: string },
): NormalizedAccessibilityFinding[] {
  return results.violations.flatMap((violation) => violation.nodes.map((node) => ({
    ruleId: violation.id,
    impact: violation.impact,
    summary: violation.help,
    target: node.target,
    failureSummary: node.failureSummary,
    pageUrl: metadata.pageUrl,
    state: metadata.state,
  })));
}
