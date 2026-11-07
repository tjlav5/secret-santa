import { describe, expect, it } from 'vitest';
import { computeSecretSantaDraw } from '../src/algorithm';

describe('Secret Santa Constrained Derangement Algorithm', () => {
  it('returns an error when fewer than 2 participants are provided', () => {
    const res = computeSecretSantaDraw([{ id: '1', name: 'Alice' }]);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error).toContain('At least 2 participants');
    }
  });

  it('pairs 2 participants cleanly', () => {
    const res = computeSecretSantaDraw([
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ]);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.assignments['a']).toBe('b');
      expect(res.assignments['b']).toBe('a');
    }
  });

  it('creates a valid bijection with no self-draws and avoids 2-cycles when N >= 3', () => {
    const people = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Carol' },
      { id: '4', name: 'Dave' },
      { id: '5', name: 'Eve' },
    ];

    for (let run = 0; run < 20; run++) {
      const res = computeSecretSantaDraw(people);
      expect(res.ok).toBe(true);
      if (res.ok) {
        const receivers = new Set(Object.values(res.assignments));
        expect(receivers.size).toBe(people.length);
        for (const p of people) {
          const target = res.assignments[p.id];
          expect(target).toBeDefined();
          expect(target).not.toBe(p.id);
          // Should not be a reciprocal 2-cycle when unconstrained
          expect(res.assignments[target]).not.toBe(p.id);
        }
      }
    }
  });

  it('strictly obeys mutual exclusion rules', () => {
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

    for (let run = 0; run < 20; run++) {
      const res = computeSecretSantaDraw(people, exclusions);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.assignments['1']).not.toBe('2');
        expect(res.assignments['2']).not.toBe('1');
        expect(res.assignments['3']).not.toBe('4');
        expect(res.assignments['4']).not.toBe('3');
      }
    }
  });

  it('detects impossible exclusion configurations gracefully', () => {
    const people = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Carol' },
    ];
    // Alice cannot draw Bob or Carol -> impossible
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
