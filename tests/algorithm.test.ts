import { describe, expect, it } from 'vitest';
import { computeSecretSantaDraw } from '../src/algorithm';
import { formatExchangeDate, parseWishlistLinks, sanitizeHttpUrl } from '../src/db';

function countCycles(assignments: Record<string, string>): number {
  const visited = new Set<string>();
  let cycles = 0;
  for (const start of Object.keys(assignments)) {
    if (visited.has(start)) continue;
    cycles++;
    let curr = start;
    while (!visited.has(curr)) {
      visited.add(curr);
      curr = assignments[curr];
    }
  }
  return cycles;
}

describe('Secret Santa Constrained Derangement Algorithm', () => {
  it('returns an error when fewer than 2 participants are provided', () => {
    const res = computeSecretSantaDraw([{ id: '1', name: 'Alice' }]);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('At least 2 participants');
    }
  });

  it('pairs 2 participants cleanly in a single cycle', () => {
    const res = computeSecretSantaDraw([
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.assignments['a']).toBe('b');
      expect(res.assignments['b']).toBe('a');
      expect(res.singleCycle).toBe(true);
      expect(countCycles(res.assignments)).toBe(1);
    }
  });

  it('guarantees a single unbroken Hamiltonian cycle across all N participants (no 3-person sub-loops when N=6 or N=8)', () => {
    const people = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Carol' },
      { id: '4', name: 'Dave' },
      { id: '5', name: 'Eve' },
      { id: '6', name: 'Frank' },
      { id: '7', name: 'Grace' },
      { id: '8', name: 'Heidi' },
    ];

    for (let run = 0; run < 40; run++) {
      const res = computeSecretSantaDraw(people);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.singleCycle).toBe(true);
        expect(countCycles(res.assignments)).toBe(1);
        const receivers = new Set(Object.values(res.assignments));
        expect(receivers.size).toBe(people.length);
        for (const p of people) {
          expect(res.assignments[p.id]).not.toBe(p.id);
        }
      }
    }
  });

  it('strictly obeys mutual exclusion rules while maintaining a single cycle when possible', () => {
    const people = [
      { id: '1', name: 'TJ' },
      { id: '2', name: 'Elena' },
      { id: '3', name: 'Marcus' },
      { id: '4', name: 'Chloe' },
    ];
    const exclusions = [
      { participant_id: '1', excluded_participant_id: '2' },
      { participant_id: '2', excluded_participant_id: '1' },
      { participant_id: '3', excluded_participant_id: '4' },
      { participant_id: '4', excluded_participant_id: '3' },
    ];

    for (let run = 0; run < 25; run++) {
      const res = computeSecretSantaDraw(people, exclusions);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.singleCycle).toBe(true);
        expect(countCycles(res.assignments)).toBe(1);
        expect(res.assignments['1']).not.toBe('2');
        expect(res.assignments['2']).not.toBe('1');
        expect(res.assignments['3']).not.toBe('4');
        expect(res.assignments['4']).not.toBe('3');
      }
    }
  });

  it('falls back gracefully to multi-cycle derangements when exclusions forbid a single Hamiltonian cycle', () => {
    // Two isolated triads {1,2,3} and {4,5,6} prohibited from gifting across triads
    const groupA = ['1', '2', '3'];
    const groupB = ['4', '5', '6'];
    const people = [...groupA, ...groupB].map((id) => ({ id, name: `P${id}` }));
    const exclusions = [];
    for (const a of groupA) {
      for (const b of groupB) {
        exclusions.push({ participant_id: a, excluded_participant_id: b });
        exclusions.push({ participant_id: b, excluded_participant_id: a });
      }
    }

    const res = computeSecretSantaDraw(people, exclusions);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.singleCycle).toBe(false);
      expect(countCycles(res.assignments)).toBe(2);
    }
  });

  it('detects impossible exclusion configurations gracefully', () => {
    const people = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Carol' },
    ];
    const exclusions = [
      { participant_id: '1', excluded_participant_id: '2' },
      { participant_id: '1', excluded_participant_id: '3' },
    ];

    const res = computeSecretSantaDraw(people, exclusions);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('Alice');
    }
  });
});

describe('URL Sanitization & Formatting Helpers', () => {
  it('blocks javascript:, data:, and invalid URLs while normalizing http(s) links', () => {
    expect(sanitizeHttpUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeHttpUrl('  JaVaScRiPt:confirm(document.cookie) ')).toBeNull();
    expect(sanitizeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeHttpUrl('vbscript:msgbox(1)')).toBeNull();
    expect(sanitizeHttpUrl('')).toBeNull();

    expect(sanitizeHttpUrl('https://example.com/gift?id=1')).toBe('https://example.com/gift?id=1');
    expect(sanitizeHttpUrl('bookshop.org/lists/holiday')).toBe('https://bookshop.org/lists/holiday');
  });

  it('strips unsafe URLs when parsing stored wishlist JSON', () => {
    const raw = JSON.stringify([
      { title: 'Safe Mug', url: 'https://example.com/mug' },
      { title: 'XSS Link', url: 'javascript:alert(1)' },
    ]);
    const parsed = parseWishlistLinks(raw);
    expect(parsed).toEqual([{ title: 'Safe Mug', url: 'https://example.com/mug' }]);
  });

  it('formats YYYY-MM-DD dates into readable calendar strings', () => {
    expect(formatExchangeDate('2026-12-24')).toBe('Dec 24, 2026');
    expect(formatExchangeDate('')).toBe('');
  });
});
