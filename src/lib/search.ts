import type { SearchHit } from "../data/types";

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[?.,]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

export function matchSearchHit(
  hits: SearchHit[],
  query: string,
  mutationApplied: boolean,
): SearchHit | undefined {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;
  const available = hits.filter((hit) => !hit.requiresMutation || mutationApplied);

  const exact = available.find((hit) => hit.query.toLowerCase() === normalized);
  if (exact) return exact;

  const scored = available
    .map((hit) => {
      const haystack = `${hit.query} ${hit.keywords.join(" ")} ${hit.answer}`.toLowerCase();
      let score = 0;
      if (haystack.includes(normalized)) score += 8;
      for (const keyword of hit.keywords) {
        if (normalized.includes(keyword.toLowerCase())) score += 5;
        if (haystack.includes(keyword.toLowerCase()) && normalized.includes(keyword.split(" ")[0] ?? "")) {
          score += 1;
        }
      }
      for (const token of tokenize(normalized)) {
        if (haystack.includes(token)) score += 1;
      }
      return { hit, score };
    })
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.hit;
}

export const SUGGESTIONS = [
  "Why did we change the deployment process?",
  "Who owns the payment service?",
  "What changed in Engineering this week?",
  "Show recent security decisions.",
];

export const MUTATION_QUERY = "Why do database migrations happen on Tuesday now?";

export function searchSuggestions(mutationApplied: boolean): string[] {
  return mutationApplied ? [...SUGGESTIONS, MUTATION_QUERY] : SUGGESTIONS;
}
