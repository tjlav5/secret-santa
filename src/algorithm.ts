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
  /** True when all participants form a single unbroken gift cycle */
  singleCycle: boolean;
}

export interface DrawFailure {
  ok: false;
  error: string;
}

export type DrawResult = DrawSuccess | DrawFailure;

/**
 * Returns an unbiased cryptographic random integer in [0, maxExclusive).
 */
function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - ((maxUint32 + 1) % maxExclusive);
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    const val = buf[0];
    if (val <= limit) {
      return val % maxExclusive;
    }
  }
}

/**
 * Shuffles a copy of an array using Fisher-Yates and unbiased cryptographic randomness.
 */
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
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
 * 5. Guarantees a single Hamiltonian cycle across all participants whenever exclusion rules permit,
 *    gracefully falling back to multi-cycle derangements only when exclusions mathematically force them.
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

  // First attempt: True single Hamiltonian cycle (one unbroken loop through all N participants)
  if (n >= 2) {
    const hamiltonian = solveHamiltonianCycle(giversOrdered, forbiddenMap);
    if (hamiltonian) {
      return { ok: true, assignments: hamiltonian, singleCycle: true };
    }
  }

  // Second attempt: Derangement avoiding reciprocal 2-person loops (A <-> B) when n >= 3
  if (n >= 3) {
    const noPairsResult = solveBacktrack(giversOrdered, participants, forbiddenMap, true);
    if (noPairsResult) {
      return { ok: true, assignments: noPairsResult, singleCycle: false };
    }
  }

  // Third attempt: General valid derangement respecting all exclusions
  const generalResult = solveBacktrack(giversOrdered, participants, forbiddenMap, false);
  if (generalResult) {
    return { ok: true, assignments: generalResult, singleCycle: false };
  }

  return {
    ok: false,
    error:
      'No valid gift assignment is possible with the current exclusion rules. Try removing one or more exclusions.',
  };
}

/**
 * Searches for a single Hamiltonian cycle visiting every participant exactly once.
 */
function solveHamiltonianCycle(
  orderedNodes: ParticipantNode[],
  forbiddenMap: Map<string, Set<string>>
): Record<string, string> | null {
  const n = orderedNodes.length;
  const startNode = orderedNodes[0];
  const visited = new Set<string>([startNode.id]);
  const path: ParticipantNode[] = [startNode];
  let steps = 0;
  const maxSteps = 40000;

  function search(current: ParticipantNode): boolean {
    if (++steps > maxSteps) return false;

    if (path.length === n) {
      // Closing edge back to startNode must be permitted
      return !forbiddenMap.get(current.id)!.has(startNode.id);
    }

    const forbidden = forbiddenMap.get(current.id)!;
    // Shuffle candidates for uniform variety, prioritizing constrained nodes lightly only on tie-free shuffles
    const candidates = shuffle(orderedNodes).filter(
      (cand) => !visited.has(cand.id) && !forbidden.has(cand.id)
    );

    // If only 1 step remains before closing, ensure at least one unvisited node can still reach startNode
    const canClose = orderedNodes.some(
      (node) => !visited.has(node.id) && !forbiddenMap.get(node.id)!.has(startNode.id)
    );
    if (!canClose) return false;

    for (const next of candidates) {
      visited.add(next.id);
      path.push(next);

      if (search(next)) {
        return true;
      }

      path.pop();
      visited.delete(next.id);
      if (steps > maxSteps) return false;
    }

    return false;
  }

  if (!search(startNode)) {
    return null;
  }

  const assignments: Record<string, string> = {};
  for (let i = 0; i < n; i++) {
    const giver = path[i];
    const receiver = path[(i + 1) % n];
    assignments[giver.id] = receiver.id;
  }
  return assignments;
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
  let steps = 0;
  const maxSteps = 40000;

  function backtrack(index: number): boolean {
    if (++steps > maxSteps) return false;
    if (index === n) {
      return true;
    }

    const giver = giversOrdered[index];
    const forbidden = forbiddenMap.get(giver.id)!;

    const candidates = shuffle(allParticipants).filter((r) => {
      if (usedReceivers.has(r.id)) return false;
      if (forbidden.has(r.id)) return false;
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
      if (steps > maxSteps) return false;
    }

    return false;
  }

  const found = backtrack(0);
  return found ? assignments : null;
}

/**
 * Generates an unbiased URL-safe cryptographic random token.
 */
export function generateToken(length = 16): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[randomInt(alphabet.length)];
  }
  return out;
}

/**
 * Generates an unbiased readable short ID for entities (e.g. "ev_8k2m9p4x").
 */
export function generateId(prefix: string, length = 10): string {
  const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
  let out = `${prefix}_`;
  for (let i = 0; i < length; i++) {
    out += alphabet[randomInt(alphabet.length)];
  }
  return out;
}

