export type AccessibilityTarget = Array<string | readonly string[]>;

type AxeNode = {
  target: AccessibilityTarget;
  failureSummary?: string | null;
};

type AxeViolation = {
  id: string;
  impact?: string | null;
  help: string;
  nodes: AxeNode[];
};

type AxeResults = {
  violations: AxeViolation[];
};

export type AccessibilityFindingMetadata = {
  pageUrl: string;
  state?: string;
};

export type NormalizedAccessibilityFinding = {
  ruleId: string;
  impact: string | null;
  summary: string;
  target: AccessibilityTarget;
  failureSummary: string | null;
  pageUrl: string;
  state?: string;
};

export function normalizeAccessibilityFindings(
  results: AxeResults,
  metadata: AccessibilityFindingMetadata,
): NormalizedAccessibilityFinding[] {
  return results.violations.flatMap((violation) => violation.nodes.map((node) => ({
    ruleId: violation.id,
    impact: violation.impact ?? null,
    summary: violation.help,
    target: node.target,
    failureSummary: node.failureSummary ?? null,
    pageUrl: metadata.pageUrl,
    state: metadata.state,
  })));
}
