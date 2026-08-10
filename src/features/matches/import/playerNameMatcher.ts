import type { UUID } from '@/types';
import type { MappedPlayer, PlayerMappingStatus } from './cricheroesPdfTypes';

export type AcademyPlayerCandidate = {
  id: UUID;
  fullName: string | null;
  email: string;
};

/** Normalize string for comparison (lowercase, remove punctuation, collapse spaces) */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Calculate Levenshtein distance between two strings */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: b.length + 1 }, () =>
    Array(a.length + 1).fill(0),
  );

  for (let i = 0; i <= b.length; i++) {
    const row = matrix[i];
    if (row) row[0] = i;
  }
  for (let j = 0; j <= a.length; j++) {
    const row = matrix[0];
    if (row) row[j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const prevRow = matrix[i - 1];
      const currRow = matrix[i];
      if (!prevRow || !currRow) continue;

      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        currRow[j] = prevRow[j - 1] ?? 0;
      } else {
        currRow[j] = Math.min(
          (prevRow[j - 1] ?? 0) + 1, // substitution
          (currRow[j - 1] ?? 0) + 1, // insertion
          (prevRow[j] ?? 0) + 1, // deletion
        );
      }
    }
  }

  const lastRow = matrix[b.length];
  return lastRow ? (lastRow[a.length] ?? 0) : 0;
}

/** Calculate similarity percentage (0 to 100) */
export function calculateSimilarity(name1: string, name2: string): number {
  const norm1 = normalizeName(name1);
  const norm2 = normalizeName(name2);

  if (norm1 === norm2) return 100;
  if (!norm1 || !norm2) return 0;

  // Check initial / word overlap
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');

  // Exact word match overlap
  const matchingWords = words1.filter((w) => words2.includes(w));
  if (matchingWords.length > 0 && (words1.length === 1 || words2.length === 1)) {
    return 90;
  }

  const maxLength = Math.max(norm1.length, norm2.length);
  const dist = levenshteinDistance(norm1, norm2);
  const score = Math.max(0, Math.round((1 - dist / maxLength) * 100));

  return score;
}

/** Automatically match a list of extracted CricHeroes player names against active academy roster */
export function matchPlayers(
  extractedNames: string[],
  academyPlayers: AcademyPlayerCandidate[],
): MappedPlayer[] {
  const uniqueNames = Array.from(new Set(extractedNames.map((n) => n.trim()))).filter(Boolean);

  return uniqueNames.map((chName) => {
    let bestMatch: AcademyPlayerCandidate | null = null;
    let highestScore = 0;

    for (const player of academyPlayers) {
      const targetName = player.fullName || player.email.split('@')[0] || '';
      const score = calculateSimilarity(chName, targetName);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = player;
      }
    }

    let status: PlayerMappingStatus = 'guest_player';
    let isGuest = true;

    if (highestScore === 100 && bestMatch) {
      status = 'exact_match';
      isGuest = false;
    } else if (highestScore >= 80 && bestMatch) {
      status = 'high_confidence';
      isGuest = false;
    } else if (highestScore >= 50 && bestMatch) {
      status = 'low_confidence';
      isGuest = false;
    }

    return {
      cricheroesName: chName,
      academyMemberId: isGuest ? null : (bestMatch?.id ?? null),
      academyMemberName: isGuest ? null : (bestMatch?.fullName ?? bestMatch?.email ?? null),
      confidenceScore: highestScore,
      status,
      isGuest,
      isIgnored: false,
    };
  });
}
