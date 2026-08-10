import { describe, expect, it } from 'vitest';
import {
  calculateSimilarity,
  matchPlayers,
  normalizeName,
  type AcademyPlayerCandidate,
} from '../import/playerNameMatcher';

describe('Player Name Matcher Engine', () => {
  const academyRoster: AcademyPlayerCandidate[] = [
    { id: 'p-1', fullName: 'Hemendra Kumar', email: 'hemendra@academy.com' },
    { id: 'p-2', fullName: 'Ankit Sharma', email: 'ankit@academy.com' },
    { id: 'p-3', fullName: 'Rahul Verma', email: 'rahul@academy.com' },
  ];

  it('normalizes names correctly', () => {
    expect(normalizeName('  Hemendra   Kumar! ')).toBe('hemendra kumar');
  });

  it('matches exact normalized names with 100% confidence', () => {
    expect(calculateSimilarity('Hemendra Kumar', 'hemendra kumar')).toBe(100);
  });

  it('handles partial and fuzzy matches', () => {
    const score = calculateSimilarity('Hemu Kumar', 'Hemendra Kumar');
    expect(score).toBeGreaterThan(60);
  });

  it('categorizes players into exact, matched, or guest player', () => {
    const extractedNames = ['Hemendra Kumar', 'Ankit S', 'Unknown Guest Player'];

    const matches = matchPlayers(extractedNames, academyRoster);

    expect(matches.length).toBe(3);

    const m0 = matches[0];
    const m1 = matches[1];
    const m2 = matches[2];

    // Exact match
    expect(m0?.cricheroesName).toBe('Hemendra Kumar');
    expect(m0?.status).toBe('exact_match');
    expect(m0?.isGuest).toBe(false);

    // High/low confidence match
    expect(m1?.cricheroesName).toBe('Ankit S');
    expect(m1?.isGuest).toBe(false);

    // Guest player (unmatched)
    expect(m2?.cricheroesName).toBe('Unknown Guest Player');
    expect(m2?.isGuest).toBe(true);
    expect(m2?.academyMemberId).toBeNull();
  });
});
