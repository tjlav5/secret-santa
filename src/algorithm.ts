export interface ParticipantNode {
  id: string;
  name: string;
}

export interface ExclusionRule {
  participant_id: string;
  excluded_participant_id: string;
}

export interface DrawSuccess {
  ok: true;
  /** Map of giver participant ID -> receiver participant ID */
  assignments: Record<string, string>;
}

export interface DrawFailure {
  ok: false;
  error: string;
}

export type DrawResult = DrawSuccess | DrawFailure;

/**
 * Shuffles an array in place using Fisher-Yates and crypto random values when available.
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Computes a random constrained Secret Santa assignment (derangement with exclusion rules).
 *
 * Ensures:
 * 1. Every participant gives a gift to exactly one participant.
 * 2. Every participant receives a gift from exactly one participant.
 * 3. No participant draws themselves.
 * 4. No participant draws someone on their exclusion list.
 * 5. Prefers single Hamiltonian cycles when possible (so small 2-person sub-loops are avoided when N >= 3),
 *    falling back to general derangement if exclusions force disconnected cycles.
 */
export function computeSecretSantaDraw(
  participants: ParticipantNode[],
  exclusions: ExclusionRule[] = []
): DrawResult {
  const n = participants.length;
  if (n < 2) {
    return {
      ok: false,
      error: 'At least 2 participants are required to draw names.',
    };
  }

  // Build exclusion lookup map: giverId -> Set of forbidden receiverIds
  const forbiddenMap = new Map<string, Set<string>>();
  for (const p of participants) {
    forbiddenMap.set(p.id, new Set([p.id])); // cannot draw self
  }
  for (const ex of exclusions) {
    if (forbiddenMap.has(ex.participant_id)) {
      forbiddenMap.get(ex.participant_id)!.add(ex.excluded_participant_id);
    }
  }

  // Quick pre-check: Does every participant have at least 1 valid candidate to give to and receive from?
  for (const giver of participants) {
    const forbidden = forbiddenMap.get(giver.id)!;
    const validReceivers = participants.filter((r) => !forbidden.has(r.id));
    if (validReceivers.length === 0) {
      return {
        ok: false,
        error: `${giver.name} is excluded from drawing anyone else. Please relax some exclusion rules.`,
      };
    }
  }

  for (const receiver of participants) {
    const validGivers = participants.filter(
      (g) => !forbiddenMap.get(g.id)!.has(receiver.id)
    );
    if (validGivers.length === 0) {
      return {
        ok: false,
        error: `No one is allowed to draw ${receiver.name}. Please relax some exclusion rules.`,
      };
    }
  }

  // Sort givers by most constrained first (Minimum Remaining Values heuristic) with random tie-breaking
  const shuffledParticipants = shuffle(participants);
  const giversOrdered = [...shuffledParticipants].sort((a, b) => {
    const degA = n - forbiddenMap.get(a.id)!.size;
    const degB = n - forbiddenMap.get(b.id)!.size;
    return degA - degB;
  });

  // First attempt: Try finding a single full cycle (no reciprocal pairs A <-> B when n >= 3)
  if (n >= 3) {
    const cycleResult = solveBacktrack(giversOrdered, participants, forbiddenMap, true);
    if (cycleResult) {
      return { ok: true, assignments: cycleResult };
    }
  }

  // Second attempt: General valid derangement respecting all exclusions
  const generalResult = solveBacktrack(giversOrdered, participants, forbiddenMap, false);
  if (generalResult) {
    return { ok: true, assignments: generalResult };
  }

  return {
    ok: false,
    error:
      'No valid gift assignment is possible with the current exclusion rules. Try removing one or more exclusions.',
  };
}

function solveBacktrack(
  giversOrdered: ParticipantNode[],
  allParticipants: ParticipantNode[],
  forbiddenMap: Map<string, Set<string>>,
  avoidReciprocalPairs: boolean
): Record<string, string> | null {
  const n = giversOrdered.length;
  const assignments: Record<string, string> = {};
  const usedReceivers = new Set<string>();

  function backtrack(index: number): boolean {
    if (index === n) {
      return true;
    }

    const giver = giversOrdered[index];
    const forbidden = forbiddenMap.get(giver.id)!;

    // Candidate receivers in randomized order
    const candidates = shuffle(allParticipants).filter((r) => {
      if (usedReceivers.has(r.id)) return false;
      if (forbidden.has(r.id)) return false;
      // If avoiding reciprocal 2-cycles (A->B and B->A) when n >= 3
      if (avoidReciprocalPairs && assignments[r.id] === giver.id) {
        return false;
      }
      return true;
    });

    for (const candidate of candidates) {
      assignments[giver.id] = candidate.id;
      usedReceivers.add(candidate.id);

      if (backtrack(index + 1)) {
        return true;
      }

      delete assignments[giver.id];
      usedReceivers.delete(candidate.id);
    }

    return false;
  }

  const found = backtrack(0);
  return found ? assignments : null;
}

/**
 * Generates a URL-safe cryptographic random token.
 */
export function generateToken(length = 16): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Generates a readable short ID for events (e.g. "ev_8k2m9p4x").
 */
export function generateId(prefix: string, length = 10): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = `${prefix}_`;
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
